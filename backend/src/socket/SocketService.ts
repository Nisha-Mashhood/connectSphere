import { Server, Socket } from 'socket.io';
import { EventEmitter } from 'events';
import mongoose from 'mongoose';
import logger from '../core/Utils/Logger';
import { ContactRepository } from '../Modules/Contact/Repositry/ContactRepositry';
import { GroupRepository } from '../Modules/Group/Repositry/GroupRepositry';
import { ChatRepository } from '../Modules/Chat/Repositry/ChatRepositry';
import { UserRepository } from '../Modules/Auth/Repositry/UserRepositry';
import { NotificationService, TaskNotificationPayload } from '../Modules/Notification/Service/NotificationService';
import Group from '../models/group.model';
import Collaboration from '../models/collaboration';
import UserConnection from '../models/userConnection.modal';
import { CallData, CallOffer, GroupIceCandidateData, MarkAsReadData, Message, TypingData } from '../Interfaces/Types/ISocketService';


export class SocketService {
  private io: Server | null = null;
  public static notificationEmitter: EventEmitter = new EventEmitter();
  private sentNotifications: Set<string> = new Set();
  private activeOffers: Map<string, CallOffer> = new Map();
  private endedCalls: Set<string> = new Set();
  private activeChats: Map<string, string> = new Map(); // userId -> chatKey
  private contactsRepo: ContactRepository;
  private groupRepo: GroupRepository;
  private chatRepo: ChatRepository;
  private userRepo: UserRepository;
  private notificationService: NotificationService;

  constructor() {
    this.contactsRepo = new ContactRepository();
    this.groupRepo = new GroupRepository();
    this.chatRepo = new ChatRepository();
    this.userRepo = new UserRepository();
    this.notificationService = new NotificationService();
  }

  public initialize(io: Server): void {
    this.io = io;
    this.notificationService.initializeSocket(io);
    logger.info('Socket.IO server initialized');

    // Subscribe to task notifications
    SocketService.notificationEmitter.on('notification', (notification: TaskNotificationPayload) => {
      this.emitTaskNotification(notification);
    });

    this.io.on('connection', (socket: Socket) => {
      this.handleConnection(socket);
    });
  }

  private handleConnection(socket: Socket): void {
    const userId = socket.handshake.auth.userId as string;
    socket.data.userId = userId;
    logger.info(`New client connected: socketId=${socket.id}, userId=${userId}, auth=${JSON.stringify(socket.handshake.auth)}`);

    socket.on('joinChats', (userId: string) => this.handleJoinChats(socket, userId));
    socket.on('joinUserRoom', (userId: string) => this.handleJoinUserRoom(socket, userId));
    socket.on('leaveUserRoom', (userId: string) => this.handleLeaveUserRoom(socket, userId));
    socket.on('activeChat', (data: { userId: string; chatKey: string }) => this.handleActiveChat(data));
    socket.on('sendMessage', (message: Message) => this.handleSendMessage(socket, message));
    socket.on('typing', (data: TypingData) => this.handleTyping(socket, data));
    socket.on('stopTyping', (data: TypingData) => this.handleStopTyping(socket, data));
    socket.on('markAsRead', (data: MarkAsReadData) => this.handleMarkAsRead(socket, data));
    socket.on('offer', (data: CallData) => this.handleOffer(socket, data));
    socket.on('answer', (data: CallData) => this.handleAnswer(socket, data));
    socket.on('ice-candidate', (data: CallData) => this.handleIceCandidate(socket, data));
    socket.on('callEnded', (data: CallData) => this.handleCallEnded(socket, data));
    socket.on('groupIceCandidate', (data: GroupIceCandidateData) => this.handleGroupIceCandidate(socket, data));
    socket.on('groupOffer', (data: { groupId: string; senderId: string; recipientId: string; offer: RTCSessionDescriptionInit; callType: 'audio' | 'video'; callId: string }) => this.handleGroupOffer(socket, data));
    socket.on('groupAnswer', (data: { groupId: string; senderId: string; recipientId: string; answer: RTCSessionDescriptionInit; callType: 'audio' | 'video'; callId: string }) => this.handleGroupAnswer(socket, data));
    socket.on('groupCallEnded', (data: { groupId: string; senderId: string; recipientId: string; callType: 'audio' | 'video'; callId: string }) => this.handleGroupCallEnded(socket, data));
    socket.on('notification.read', (data: { notificationId: string; userId: string }) => this.handleNotificationRead(socket, data));
    socket.on('leaveChat', (userId: string) => this.handleLeaveChat(userId));
    socket.on('disconnect', () => this.handleDisconnect(socket));
  }

  private async handleJoinChats(socket: Socket, userId: string): Promise<void> {
    try {
      const contacts = await this.contactsRepo.findContactsByUserId(userId);
      const rooms = Array.from(
        new Set(
          contacts
            .map((contact) => {
              if (contact.type === 'group' && contact.groupId) {
                return `group_${contact.groupId._id.toString()}`;
              } else if (contact.userId && contact.targetUserId) {
                const ids = [contact.userId._id.toString(), contact.targetUserId._id.toString()].sort();
                return `chat_${ids[0]}_${ids[1]}`;
              }
              return null;
            })
            .filter(Boolean)
        )
      ) as string[];

      socket.join(rooms);
      logger.info(`User ${userId} joined rooms: ${rooms.join(', ')}`);
    } catch (error: any) {
      logger.error(`Error joining chats for user ${userId}: ${error.message}`);
      socket.emit('error', { message: 'Failed to join chats' });
    }
  }

  private handleJoinUserRoom(socket: Socket, userId: string): void {
    socket.join(`user_${userId}`);
    logger.info(`User ${userId} joined personal room: user_${userId}, socketId=${socket.id}`);
  }

  private handleLeaveUserRoom(socket: Socket, userId: string): void {
    socket.leave(`user_${userId}`);
    logger.info(`User ${userId} left personal room: user_${userId}, socketId=${socket.id}`);
  }

  private handleActiveChat(data: { userId: string; chatKey: string }): void {
    const { userId, chatKey } = data;
    this.activeChats.set(userId, chatKey);
    logger.info(`User ${userId} set active chat: ${chatKey}`);
  }

  private async handleSendMessage(socket: Socket, message: Message): Promise<void> {
    try {
      const { senderId, targetId, type, content, contentType = 'text', collaborationId, userConnectionId, groupId, _id } = message;

      if (!senderId || !targetId || !type || !content) {
        logger.error(`Missing required fields in message: ${JSON.stringify(message)}`);
        socket.emit('error', { message: 'Missing required fields' });
        return;
      }

      const timestamp = new Date();
      const timestampString = timestamp.toISOString();
      let room: string;
      let savedMessage: any;

      const senderObjectId = new mongoose.Types.ObjectId(senderId);

      if (contentType === 'text') {
        if (type === 'group') {
          const group = await this.groupRepo.getGroupById(targetId);
          if (!group) {
            logger.error(`Invalid group ID: ${targetId}`);
            socket.emit('error', { message: 'Invalid group ID' });
            return;
          }
          const isMember = await this.groupRepo.isUserInGroup(targetId, senderId);
          if (!isMember) {
            logger.error(`Sender not in group: senderId=${senderId}, groupId=${targetId}`);
            socket.emit('error', { message: 'Sender not in group' });
            return;
          }
          room = `group_${targetId}`;
          savedMessage = await this.chatRepo.saveChatMessage({
            senderId: senderObjectId,
            groupId: new mongoose.Types.ObjectId(groupId || targetId),
            content,
            contentType,
            timestamp,
            isRead: false,
            status: 'sent',
          });
        } else {
          const contact = await this.contactsRepo.findContactByUsers(senderId, targetId);
          if (!contact || !contact._id) {
            logger.error(`Invalid contact for sender: ${senderId}, target: ${targetId}`);
            socket.emit('error', { message: 'Invalid contact' });
            return;
          }
          const ids = [contact.userId.toString(), contact.targetUserId?.toString()].sort();
          room = `chat_${ids[0]}_${ids[1]}`;
          savedMessage = await this.chatRepo.saveChatMessage({
            senderId: senderObjectId,
            ...(type === 'user-mentor' && {
              collaborationId: new mongoose.Types.ObjectId(collaborationId || contact.collaborationId?.toString()),
            }),
            ...(type === 'user-user' && {
              userConnectionId: new mongoose.Types.ObjectId(userConnectionId || contact.userConnectionId?.toString()),
            }),
            content,
            contentType,
            timestamp,
            isRead: false,
            status: 'sent',
          });
        }
      } else {
        savedMessage = {
          _id: _id || new mongoose.Types.ObjectId(),
          ...message,
          timestamp,
        };
        if (!_id) {
          logger.error(`Non-text message requires saved message _id: ${JSON.stringify(message)}`);
          socket.emit('error', { message: 'Non-text message requires saved message _id' });
          return;
        }
        savedMessage = await this.chatRepo.findChatMessageById(_id);
        if (!savedMessage) {
          logger.error(`Invalid message ID for non-text message: ${_id}`);
          socket.emit('error', { message: 'Invalid message ID' });
          return;
        }
        if (type === 'group') {
          room = `group_${targetId}`;
        } else {
          const contact = await this.contactsRepo.findContactByUsers(senderId, targetId);
          const ids = [contact?.userId.toString(), contact?.targetUserId?.toString()].sort();
          room = `chat_${ids[0]}_${ids[1]}`;
        }
      }

      let recipientIds: string[] = [];
      let chatKey: string | null = null;

      if (savedMessage.groupId) {
        chatKey = `group_${savedMessage.groupId.toString()}`;
        const group = await Group.findById(savedMessage.groupId);
        if (group) {
          recipientIds = group.members
            .filter((member) => member.userId.toString() !== senderId)
            .map((member) => member.userId.toString());
        }
      } else if (savedMessage.collaborationId) {
        chatKey = `user-mentor_${savedMessage.collaborationId.toString()}`;
        const collab = await Collaboration.findById(savedMessage.collaborationId);
        if (collab) {
          recipientIds = [
            collab.userId.toString() === senderId ? collab.mentorId.toString() : collab.userId.toString(),
          ];
        }
      } else if (savedMessage.userConnectionId) {
        chatKey = `user-user_${savedMessage.userConnectionId.toString()}`;
        const connection = await UserConnection.findById(savedMessage.userConnectionId);
        if (connection) {
          recipientIds = [
            connection.requester.toString() === senderId ? connection.recipient.toString() : connection.requester.toString(),
          ];
        }
      }

      if (chatKey && recipientIds.length > 0 && this.io) {
        const socketsInRoom = await this.io.in(room).allSockets();
        const connectedUserIds = new Set<string>();
        for (const socketId of socketsInRoom) {
          const s = this.io.sockets.sockets.get(socketId);
          if (s && s.data.userId) {
            connectedUserIds.add(s.data.userId);
          }
        }

        for (const recipientId of recipientIds) {
          try {
            const notification = await this.notificationService.sendNotification(
              recipientId,
              'message',
              senderId,
              chatKey,
              contentType
            );
            logger.info(`Emitted via notification emitter to user_${recipientId}: ${notification._id}`);
          } catch (error: any) {
            logger.warn(`Failed to send notification to user ${recipientId}: ${error.message}`);
          }
        }
      }

      if (!savedMessage) {
        logger.error(`Failed to save message: ${JSON.stringify(message)}`);
        socket.emit('error', { message: 'Failed to save message' });
        return;
      }

      const messageData = {
        senderId,
        targetId,
        type,
        content,
        contentType,
        thumbnailUrl: savedMessage.thumbnailUrl,
        fileMetadata: savedMessage.fileMetadata,
        ...(type === 'group' && { groupId: groupId || targetId }),
        ...(type === 'user-mentor' && { collaborationId: collaborationId || savedMessage?.collaborationId?.toString() }),
        ...(type === 'user-user' && { userConnectionId: userConnectionId || savedMessage?.userConnectionId?.toString() }),
        timestamp: timestampString,
        _id: savedMessage._id,
        status: savedMessage.status,
        isRead: savedMessage.isRead || false,
      };

      socket.broadcast.to(room).emit('receiveMessage', messageData);
      socket.emit('messageSaved', messageData);
      logger.info(`Message broadcasted to room ${room}: ${JSON.stringify(messageData)}`);
    } catch (error: any) {
      logger.error(`Error sending message: ${error.message}`);
      socket.emit('error', { message: 'Failed to send message' });
    }
  }

  private handleTyping(socket: Socket, data: TypingData): void {
    const { userId, targetId, type, chatKey } = data;
    let room: string;
    if (type === 'group') {
      room = `group_${targetId}`;
    } else {
      const ids = [userId, targetId].sort();
      room = `chat_${ids[0]}_${ids[1]}`;
    }
    socket.broadcast.to(room).emit('typing', { userId, chatKey });
    logger.info(`Broadcasting typing to room ${room}: userId=${userId}, chatKey=${chatKey}`);
  }

  private handleStopTyping(socket: Socket, data: TypingData): void {
    const { userId, targetId, type, chatKey } = data;
    let room: string;
    if (type === 'group') {
      room = `group_${targetId}`;
    } else {
      const ids = [userId, targetId].sort();
      room = `chat_${ids[0]}_${ids[1]}`;
    }
    socket.to(room).emit('stopTyping', { userId, chatKey });
    logger.info(`Broadcasting stopTyping to room ${room}: userId=${userId}, chatKey=${chatKey}`);
  }

  private async handleMarkAsRead(socket: Socket, data: MarkAsReadData): Promise<void> {
    try {
      const { chatKey, userId, type } = data;
      const updatedMessages = await this.chatRepo.markMessagesAsRead(chatKey, userId, type);
      const notifications = await this.notificationService.getNotifications(userId);
      const messageNotifications = notifications.filter(
        (n) => n.type === 'message' && n.relatedId === chatKey && n.status === 'unread'
      );

      for (const notification of messageNotifications) {
        const updatedNotification = await this.notificationService.markNotificationAsRead(notification._id.toString());
        if (updatedNotification && this.io) {
          this.io.to(`user_${userId}`).emit('notification.read', { notificationId: notification._id });
        }
      }

      let room: string;
      if (type === 'group') {
        room = `group_${chatKey.replace('group_', '')}`;
      } else {
        const contact = await this.contactsRepo.findContactByUsers(userId, chatKey.replace(/^(user-mentor_|user-user_)/, ''));
        const ids = [contact?.userId.toString(), contact?.targetUserId?.toString()].sort();
        room = `chat_${ids[0]}_${ids[1]}`;
      }

      this.io?.to(room).emit('messagesRead', { chatKey, userId, messageIds: updatedMessages });
      logger.info(`Marked messages as read for user ${userId} in chat ${chatKey}`);
    } catch (error: any) {
      logger.error(`Error marking messages as read: ${error.message}`);
      socket.emit('error', { message: 'Failed to mark messages as read' });
    }
  }

  private async handleOffer(socket: Socket, data: CallData): Promise<void> {
    try {
      const { userId, targetId, type, chatKey, offer, callType } = data;
      logger.info(`Received ${callType} offer from ${userId} for chatKey: ${chatKey}`);
      let room: string;
      let recipientIds: string[] = [];

      if (type === 'group') {
        room = `group_${targetId}`;
        const group = await this.groupRepo.getGroupById(targetId);
        if (!group) {
          logger.error(`Invalid group ID: ${targetId}`);
          socket.emit('error', { message: 'Invalid group ID' });
          return;
        }
        recipientIds = group.members
          .filter((member) => member.userId.toString() !== userId)
          .map((member) => member.userId.toString());
      } else {
        const contact = await this.contactsRepo.findContactByUsers(userId, targetId);
        if (!contact) {
          logger.error(`Invalid contact for offer: userId=${userId}, targetId=${targetId}`);
          socket.emit('error', { message: 'Invalid contact' });
          return;
        }
        const ids = [contact.userId.toString(), contact.targetUserId?.toString()].sort();
        room = `chat_${ids[0]}_${ids[1]}`;
        recipientIds = [targetId];
      }

      const sender = await this.userRepo.findById(userId);
      socket.broadcast.to(room).emit('offer', {
        userId,
        targetId,
        type,
        chatKey,
        offer,
        callType,
        senderName: sender?.name,
      });

      const callId = `${chatKey}_${Date.now()}`;
      const socketsInRoom = await this.io?.in(room).allSockets();
      const connectedUserIds = new Set<string>();
      if (socketsInRoom) {
        for (const socketId of socketsInRoom) {
          const s = this.io?.sockets.sockets.get(socketId);
          if (s && s.data.userId) {
            connectedUserIds.add(s.data.userId);
          }
        }
      }

      for (const recipientId of recipientIds) {
        try {
          const notification = await this.notificationService.sendNotification(
            recipientId,
            'incoming_call',
            userId,
            chatKey,
            callType,
            callId
          );
          logger.info(`Created call notification for user ${recipientId}: ${notification._id}`);
        } catch (error: any) {
          logger.warn(`Failed to send call notification to user ${recipientId}: ${error.message}`);
        }
      }

      const endTimeout = setTimeout(async () => {
        const call = this.activeOffers.get(callId);
        if (!call) return;

        const socketsInRoom = await this.io?.in(room).allSockets();
        const connectedUserIds = new Set<string>();
        if (socketsInRoom) {
          for (const socketId of socketsInRoom) {
            const s = this.io?.sockets.sockets.get(socketId);
            if (s && s.data.userId) {
              connectedUserIds.add(s.data.userId);
            }
          }
        }

        for (const recipientId of recipientIds) {
          if (!connectedUserIds.has(recipientId)) {
            const notification = await this.notificationService.updateCallNotificationToMissed(
              recipientId,
              callId,
              `Missed ${callType} call from ${userId}`
            );
            if (notification && this.io) {
              this.io.to(`user_${recipientId}`).emit('notification.updated', notification);
            } else {
              logger.info(`No incoming call notification found for call ${callId}, creating new`);
              const newNotification = await this.notificationService.sendNotification(
                recipientId,
                'missed_call',
                userId,
                chatKey,
                callType,
                callId
              );
              logger.info(`Emitted notification.new to user_${recipientId}: ${newNotification._id}`);
            }
          }
        }

        socket.to(room).emit('callEnded', { userId, targetId, type, chatKey, callType });
        socket.emit('callEnded', { userId, targetId, type, chatKey, callType });
        this.activeOffers.delete(callId);
      }, 30000);

      this.activeOffers.set(callId, { senderId: userId, targetId, type, chatKey, callType, recipientIds, endTimeout });
    } catch (error: any) {
      logger.error(`Error broadcasting offer: ${error.message}`);
      socket.emit('error', { message: 'Failed to send offer' });
    }
  }

  private async handleAnswer(socket: Socket, data: CallData): Promise<void> {
    try {
      const { userId, targetId, type, chatKey, answer, callType } = data;
      logger.info(`Received ${callType} answer from ${userId} for chatKey: ${chatKey}`);
      let room: string;

      if (type === 'group') {
        room = `group_${targetId}`;
      } else {
        const contact = await this.contactsRepo.findContactByUsers(userId, targetId);
        if (!contact) {
          logger.error(`Invalid contact for answer: userId=${userId}, targetId=${targetId}`);
          socket.emit('error', { message: 'Invalid contact' });
          return;
        }
        const ids = [contact.userId.toString(), contact.targetUserId?.toString()].sort();
        room = `chat_${ids[0]}_${ids[1]}`;
      }

      socket.broadcast.to(room).emit('answer', { userId, targetId, type, chatKey, answer, callType });

      const callId = Array.from(this.activeOffers.keys()).find(
        (id) => this.activeOffers.get(id)?.chatKey === chatKey && this.activeOffers.get(id)?.senderId === targetId
      );
      if (callId) {
        const call = this.activeOffers.get(callId);
        if (call) {
          clearTimeout(call.endTimeout);
          this.activeOffers.delete(callId);
        }
      }
    } catch (error: any) {
      logger.error(`Error broadcasting answer: ${error.message}`);
      socket.emit('error', { message: 'Failed to send answer' });
    }
  }

  private async handleIceCandidate(socket: Socket, data: CallData): Promise<void> {
    try {
      const { userId, targetId, type, chatKey, candidate, callType } = data;
      logger.info(`Received ${callType} ICE candidate from ${userId} for chatKey: ${chatKey}`);
      let room: string;

      if (type === 'group') {
        room = `group_${targetId}`;
      } else {
        const contact = await this.contactsRepo.findContactByUsers(userId, targetId);
        if (!contact) {
          logger.error(`Invalid contact for ICE candidate: userId=${userId}, targetId=${targetId}`);
          socket.emit('error', { message: 'Invalid contact' });
          return;
        }
        const ids = [contact.userId.toString(), contact.targetUserId?.toString()].sort();
        room = `chat_${ids[0]}_${ids[1]}`;
      }

      socket.broadcast.to(room).emit('ice-candidate', { userId, targetId, type, chatKey, candidate, callType });
    } catch (error: any) {
      logger.error(`Error broadcasting ICE candidate: ${error.message}`);
      socket.emit('error', { message: 'Failed to send ICE candidate' });
    }
  }

  private async handleCallEnded(socket: Socket, data: CallData): Promise<void> {
    try {
      const { userId, targetId, type, chatKey, callType } = data;
      const callId = `${chatKey}_${Date.now()}`;
      if (this.endedCalls.has(callId)) {
        logger.info(`Ignoring duplicate callEnded for callId: ${callId}, chatKey: ${chatKey}`);
        return;
      }
      logger.info(`Received callEnded from ${userId} for chatKey: ${chatKey}, callType: ${callType}`);
      let room: string;

      if (type === 'group') {
        room = `group_${targetId}`;
      } else {
        const contact = await this.contactsRepo.findContactByUsers(userId, targetId);
        if (!contact) {
          logger.error(`Invalid contact for callEnded: userId=${userId}, targetId=${targetId}`);
          socket.emit('error', { message: 'Invalid contact' });
          return;
        }
        const ids = [contact.userId.toString(), contact.targetUserId?.toString()].sort();
        room = `chat_${ids[0]}_${ids[1]}`;
      }

      this.io?.to(room).emit('callEnded', { userId, targetId, type, chatKey, callType });
      this.endedCalls.add(callId);
      setTimeout(() => this.endedCalls.delete(callId), 60000);

      const callIdToClear = Array.from(this.activeOffers.keys()).find(
        (id) => this.activeOffers.get(id)?.chatKey === chatKey && this.activeOffers.get(id)?.senderId === userId
      );
      if (callIdToClear) {
        const call = this.activeOffers.get(callIdToClear);
        if (call) {
          clearTimeout(call.endTimeout);
          this.activeOffers.delete(callIdToClear);
        }
      }
    } catch (error: any) {
      logger.error(`Error handling callEnded: ${error.message}`);
      socket.emit('error', { message: 'Failed to end call' });
    }
  }

  private async handleGroupIceCandidate(socket: Socket, data: GroupIceCandidateData): Promise<void> {
    try {
      const { groupId, senderId, recipientId, candidate, callType, callId } = data;
      logger.info(`Received group ${callType} ICE candidate from ${senderId} to ${recipientId} for group ${groupId}, callId: ${callId}`);
      logger.info("Candidate details : ", candidate);
      // Verify group and membership
      const group = await this.groupRepo.getGroupById(groupId);
      if (!group) {
        logger.error(`Invalid group ID: ${groupId}`);
        socket.emit('error', { message: 'Invalid group ID' });
        return;
      }
      const isSenderMember = await this.groupRepo.isUserInGroup(groupId, senderId);
      const isRecipientMember = await this.groupRepo.isUserInGroup(groupId, recipientId);
      if (!isSenderMember || !isRecipientMember) {
        logger.error(`Invalid membership: senderId=${senderId}, recipientId=${recipientId}, groupId=${groupId}`);
        socket.emit('error', { message: 'Invalid group membership' });
        return;
      }

      // Emit to recipient's user room
      socket.to(`user_${recipientId}`).emit('groupIceCandidate', data);
      logger.info(`Relayed group ICE candidate to user_${recipientId}`);
    } catch (error: any) {
      logger.error(`Error relaying group ICE candidate: ${error.message}`);
      socket.emit('error', { message: 'Failed to relay group ICE candidate' });
    }
  }

  private async handleGroupOffer(socket: Socket, data: { groupId: string; senderId: string; recipientId: string; offer: RTCSessionDescriptionInit; callType: 'audio' | 'video'; callId: string }): Promise<void> {
    try {
      const { groupId, senderId, recipientId, offer, callType, callId } = data;
      logger.info(`Received group ${callType} offer from ${senderId} to ${recipientId} for group ${groupId}, callId: ${callId} with offer ${offer}`);
      const group = await this.groupRepo.getGroupById(groupId);
      if (!group) {
        logger.error(`Invalid group ID: ${groupId}`);
        socket.emit('error', { message: 'Invalid group ID' });
        return;
      }
      const isSenderMember = await this.groupRepo.isUserInGroup(groupId, senderId);
      const isRecipientMember = await this.groupRepo.isUserInGroup(groupId, recipientId);
      if (!isSenderMember || !isRecipientMember) {
        logger.error(`Invalid membership: senderId=${senderId}, recipientId=${recipientId}, groupId=${groupId}`);
        socket.emit('error', { message: 'Invalid group membership' });
        return;
      }

      socket.to(`user_${recipientId}`).emit('groupOffer', data);
      logger.info(`Relayed group offer to user_${recipientId}`);
    } catch (error: any) {
      logger.error(`Error relaying group offer: ${error.message}`);
      socket.emit('error', { message: 'Failed to relay group offer' });
    }
  }

  private async handleGroupAnswer(socket: Socket, data: { groupId: string; senderId: string; recipientId: string; answer: RTCSessionDescriptionInit; callType: 'audio' | 'video'; callId: string }): Promise<void> {
    try {
      const { groupId, senderId, recipientId, answer, callType, callId } = data;
      logger.info(`Received group ${callType} answer from ${senderId} to ${recipientId} for group ${groupId}, callId: ${callId} with answer ${answer}`);
      const group = await this.groupRepo.getGroupById(groupId);
      if (!group) {
        logger.error(`Invalid group ID: ${groupId}`);
        socket.emit('error', { message: 'Invalid group ID' });
        return;
      }
      const isSenderMember = await this.groupRepo.isUserInGroup(groupId, senderId);
      const isRecipientMember = await this.groupRepo.isUserInGroup(groupId, recipientId);
      if (!isSenderMember || !isRecipientMember) {
        logger.error(`Invalid membership: senderId=${senderId}, recipientId=${recipientId}, groupId=${groupId}`);
        socket.emit('error', { message: 'Invalid group membership' });
        return;
      }

      socket.to(`user_${recipientId}`).emit('groupAnswer', data);
      logger.info(`Relayed group answer to user_${recipientId}`);
    } catch (error: any) {
      logger.error(`Error relaying group answer: ${error.message}`);
      socket.emit('error', { message: 'Failed to relay group answer' });
    }
  }

  private async handleGroupCallEnded(socket: Socket, data: { groupId: string; senderId: string; recipientId: string; callType: 'audio' | 'video'; callId: string }): Promise<void> {
  try {
    const { groupId, senderId, recipientId, callType, callId } = data;
    const eventKey = `${groupId}_${callId}_${callType}`;

    // Prevent duplicate processing
    if (this.endedCalls.has(eventKey)) {
      logger.info(`Ignoring duplicate groupCallEnded for ${eventKey}`);
      return;
    }
    this.endedCalls.add(eventKey);
    logger.info(`Received groupCallEnded from ${senderId} to ${recipientId} for group ${groupId}, callId: ${callId}, callType: ${callType}`);

    const group = await this.groupRepo.getGroupById(groupId);
    if (!group) {
      logger.error(`Invalid group ID: ${groupId}`);
      socket.emit('error', { message: 'Group not found' });
      return;
    }
    const senderObjectId = new mongoose.Types.ObjectId(senderId);
    const recipientObjectId = new mongoose.Types.ObjectId(recipientId);

    const isSenderMember = group.members.some(member => member.userId.equals(senderObjectId));
    const isRecipientMember = group.members.some(member => member.userId.equals(recipientObjectId));
    if (!isSenderMember || !isRecipientMember) {
      logger.error(`Invalid members: sender ${senderId} or recipient ${recipientId} not in group ${groupId}`);
      socket.emit('error', { message: 'Invalid group members' });
      return;
    }

    if (!this.io) {
      logger.error('Socket.IO server not initialized');
      socket.emit('error', { message: 'Server not initialized' });
      return;
    }

    // Emit groupCallEnded to the recipient's user room
    // const recipientRoom = `user_${recipientId}`;
    // this.io.to(recipientRoom).emit('groupCallEnded', {
    //   groupId,
    //   senderId,
    //   recipientId,
    //   callType,
    //   callId,
    // });
    // logger.info(`Emitted groupCallEnded to ${recipientRoom} for callId: ${callId}`);

    const groupMembers = group.members
      .filter(member => !member.userId.equals(senderObjectId))
      .map(member => member.userId.toString());
    for (const memberId of groupMembers) {
      const recipientRoom = `user_${memberId}`;
      this.io.to(recipientRoom).emit('groupCallEnded', {
        groupId,
        senderId,
        recipientId: memberId,
        callType,
        callId,
      });
      logger.info(`Emitted groupCallEnded to ${recipientRoom} for callId: ${callId}`);
    }
    // Clean up endedCalls set after a timeout 
    setTimeout(() => {
      this.endedCalls.delete(eventKey);
      logger.info(`Cleaned up endedCalls entry for ${eventKey}`);
    }, 60 * 60 * 1000); // 1 hour timeout
  } catch (error) {
    logger.error(`Error handling groupCallEnded for group ${data.groupId}, callId: ${data.callId}:`, error);
    socket.emit('error', { message: 'Failed to process call termination' });
  }
}

  private async handleNotificationRead(socket: Socket, data: { notificationId: string; userId: string }): Promise<void> {
    try {
      const { notificationId, userId } = data;
      const notification = await this.notificationService.markNotificationAsRead(notificationId);
      if (notification && this.io) {
        this.io.to(`user_${userId}`).emit('notification.read', { notificationId });
        logger.info(`Notification marked as read: ${notificationId} for user ${userId}`);
      }
    } catch (error: any) {
      logger.error(`Error handling notification.read: ${error.message}`);
      socket.emit('error', { message: 'Failed to mark notification as read' });
    }
  }

  private handleLeaveChat(userId: string): void {
    this.activeChats.delete(userId);
    logger.info(`User ${userId} left active chat`);
  }

  private handleDisconnect(socket: Socket): void {
    logger.info(`User disconnected: socketId=${socket.id}, userId=${socket.data.userId}`);
  }

  private emitTaskNotification(notification: TaskNotificationPayload): void {
    if (!this.io) {
      logger.error('Socket.IO server not initialized');
      return;
    }
    if (this.sentNotifications.has(notification._id)) {
      logger.info(`Skipping duplicate notification.new: ${notification._id}`);
      return;
    }
    const room = `user_${notification.userId}`;
    this.io.to(room).emit('notification.new', notification);
    this.sentNotifications.add(notification._id);
    logger.info(`Emitted notification.new to user_${notification.userId}: ${notification._id}`);
    setTimeout(() => this.sentNotifications.delete(notification._id), 300 * 1000);
  }
}