import { Server, Socket } from "socket.io";
import mongoose from "mongoose";
import logger from "../core/Utils/Logger";
import { ContactRepository } from "../Modules/Contact/Repositry/ContactRepositry";
import { GroupRepository } from "../Modules/Group/Repositry/GroupRepositry";
import { ChatRepository } from "../Modules/Chat/Repositry/ChatRepositry";
import { NotificationService } from "../Modules/Notification/Service/NotificationService";
import Group from "../models/group.model";
import Collaboration from "../models/collaboration";
import UserConnection from "../models/userConnection.modal";
import { MarkAsReadData, Message, TypingData } from "./types";

export class ChatSocketHandler {
  private activeChats: Map<string, string> = new Map(); // userId -> chatKey
  private contactsRepo: ContactRepository;
  private groupRepo: GroupRepository;
  private chatRepo: ChatRepository;
  private notificationService: NotificationService;
  private io: Server | null = null;

  constructor(
    contactsRepo: ContactRepository,
    groupRepo: GroupRepository,
    chatRepo: ChatRepository,
    notificationService: NotificationService
  ) {
    this.contactsRepo = contactsRepo;
    this.groupRepo = groupRepo;
    this.chatRepo = chatRepo;
    this.notificationService = notificationService;
  }

  public setIo(io: Server): void {
    this.io = io;
  }

  public async handleJoinChats(socket: Socket, userId: string): Promise<void> {
    try {
      const contacts = await this.contactsRepo.findContactsByUserId(userId);
      const rooms = Array.from(
        new Set(
          contacts
            .map((contact) => {
              if (contact.type === "group" && contact.groupId) {
                return `group_${contact.groupId._id.toString()}`;
              } else if (contact.userId && contact.targetUserId) {
                const ids = [
                  contact.userId._id.toString(),
                  contact.targetUserId._id.toString(),
                ].sort();
                return `chat_${ids[0]}_${ids[1]}`;
              }
              return null;
            })
            .filter(Boolean)
        )
      ) as string[];

      socket.join(rooms);
      logger.info(`User ${userId} joined chats: ${rooms.join(", ")}`);
    } catch (error: any) {
      logger.error(`Error joining chats for user ${userId}: ${error.message}`);
      socket.emit("error", { message: "Failed to join chats" });
    }
  }

  public handleJoinUserRoom(socket: Socket, userId: string): void {
    socket.join(`user_${userId}`);
    const roomMembers =
      this.io?.sockets.adapter.rooms.get(`user_${userId}`)?.size || 0;
    logger.info(
      `User ${userId} joined personal room: user_${userId}, socketId=${socket.id}, members=${roomMembers}`
    );
  }

  public handleEnsureUserRoom(socket: Socket, data: { userId: string }): void {
    const { userId } = data;
    socket.join(`user_${userId}`);
    const roomMembers =
      this.io?.sockets.adapter.rooms.get(`user_${userId}`)?.size || 0;
    logger.info(
      `Ensured user ${userId} joined room user_${userId}, socketId=${socket.id}, members=${roomMembers}`
    );
    this.io?.to(`user_${userId}`).emit("userRoomJoined", { userId });
  }

  public handleLeaveUserRoom(socket: Socket, userId: string): void {
    socket.leave(`user_${userId}`);
    logger.info(
      `User ${userId} left personal room: user_${userId}, socketId=${socket.id}`
    );
  }

  public handleActiveChat(data: { userId: string; chatKey: string }): void {
    const { userId, chatKey } = data;
    this.activeChats.set(userId, chatKey);
    logger.info(`User ${userId} set active chat: ${chatKey}`);
  }

  public async handleSendMessage(
    socket: Socket,
    message: Message
  ): Promise<void> {
    try {
      const {
        senderId,
        targetId,
        type,
        content,
        contentType = "text",
        collaborationId,
        userConnectionId,
        groupId,
        _id,
      } = message;

      if (!senderId || !targetId || !type || !content) {
        logger.error(
          `Missing required fields in message: ${JSON.stringify(message)}`
        );
        socket.emit("error", { message: "Missing required fields" });
        return;
      }

      const timestamp = new Date();
      const timestampString = timestamp.toISOString();
      let room: string;
      let savedMessage: any;

      const senderObjectId = new mongoose.Types.ObjectId(senderId);

      if (contentType === "text") {
        if (type === "group") {
          const group = await this.groupRepo.getGroupById(targetId);
          if (!group) {
            logger.error(`Invalid group ID: ${targetId}`);
            socket.emit("error", { message: "Invalid group ID" });
            return;
          }
          const isMember = await this.groupRepo.isUserInGroup(
            targetId,
            senderId
          );
          if (!isMember) {
            logger.error(
              `Sender not in group: senderId=${senderId}, groupId=${targetId}`
            );
            socket.emit("error", { message: "Sender not in group" });
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
            status: "sent",
          });
        } else {
          const contact = await this.contactsRepo.findContactByUsers(
            senderId,
            targetId
          );
          if (!contact || !contact._id) {
            logger.error(
              `Invalid contact for sender: ${senderId}, target: ${targetId}`
            );
            socket.emit("error", { message: "Invalid contact" });
            return;
          }
          const ids = [
            contact.userId.toString(),
            contact.targetUserId?.toString(),
          ].sort();
          room = `chat_${ids[0]}_${ids[1]}`;
          savedMessage = await this.chatRepo.saveChatMessage({
            senderId: senderObjectId,
            ...(type === "user-mentor" && {
              collaborationId: new mongoose.Types.ObjectId(
                collaborationId || contact.collaborationId?.toString()
              ),
            }),
            ...(type === "user-user" && {
              userConnectionId: new mongoose.Types.ObjectId(
                userConnectionId || contact.userConnectionId?.toString()
              ),
            }),
            content,
            contentType,
            timestamp,
            isRead: false,
            status: "sent",
          });
        }
      } else {
        savedMessage = {
          _id: _id || new mongoose.Types.ObjectId(),
          ...message,
          timestamp,
        };
        if (!_id) {
          logger.error(
            `Non-text message requires saved message _id: ${JSON.stringify(
              message
            )}`
          );
          socket.emit("error", {
            message: "Non-text message requires saved message _id",
          });
          return;
        }
        savedMessage = await this.chatRepo.findChatMessageById(_id);
        if (!savedMessage) {
          logger.error(`Invalid message ID for non-text message: ${_id}`);
          socket.emit("error", { message: "Invalid message ID" });
          return;
        }
        if (type === "group") {
          room = `group_${targetId}`;
        } else {
          const contact = await this.contactsRepo.findContactByUsers(
            senderId,
            targetId
          );
          const ids = [
            contact?.userId.toString(),
            contact?.targetUserId?.toString(),
          ].sort();
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
        const collab = await Collaboration.findById(
          savedMessage.collaborationId
        );
        if (collab) {
          recipientIds = [
            collab.userId.toString() === senderId
              ? collab.mentorId.toString()
              : collab.userId.toString(),
          ];
        }
      } else if (savedMessage.userConnectionId) {
        chatKey = `user-user_${savedMessage.userConnectionId.toString()}`;
        const connection = await UserConnection.findById(
          savedMessage.userConnectionId
        );
        if (connection) {
          recipientIds = [
            connection.requester.toString() === senderId
              ? connection.recipient.toString()
              : connection.requester.toString(),
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
            const notification =
              await this.notificationService.sendNotification(
                recipientId,
                "message",
                senderId,
                chatKey,
                contentType
              );
            logger.info(
              `Emitted via notification emitter to user_${recipientId}: ${notification._id}`
            );
          } catch (error: any) {
            logger.warn(
              `Failed to send notification to user ${recipientId}: ${error.message}`
            );
          }
        }
      }

      if (!savedMessage) {
        logger.error(`Failed to save message: ${JSON.stringify(message)}`);
        socket.emit("error", { message: "Failed to save message" });
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
        ...(type === "group" && { groupId: groupId || targetId }),
        ...(type === "user-mentor" && {
          collaborationId:
            collaborationId || savedMessage?.collaborationId?.toString(),
        }),
        ...(type === "user-user" && {
          userConnectionId:
            userConnectionId || savedMessage?.userConnectionId?.toString(),
        }),
        timestamp: timestampString,
        _id: savedMessage._id,
        status: savedMessage.status,
        isRead: savedMessage.isRead || false,
      };

      socket.broadcast.to(room).emit("receiveMessage", messageData);
      socket.emit("messageSaved", messageData);
      logger.info(
        `Message broadcasted to room ${room}: ${JSON.stringify(messageData)}`
      );
    } catch (error: any) {
      logger.error(`Error sending message: ${error.message}`);
      socket.emit("error", { message: "Failed to send message" });
    }
  }

  public handleTyping(socket: Socket, data: TypingData): void {
    const { userId, targetId, type, chatKey } = data;
    let room: string;
    if (type === "group") {
      room = `group_${targetId}`;
    } else {
      const ids = [userId, targetId].sort();
      room = `chat_${ids[0]}_${ids[1]}`;
    }
    socket.broadcast.to(room).emit("typing", { userId, chatKey });
    logger.info(
      `Broadcasting typing to room ${room}: userId=${userId}, chatKey=${chatKey}`
    );
  }

  public handleStopTyping(socket: Socket, data: TypingData): void {
    const { userId, targetId, type, chatKey } = data;
    let room: string;
    if (type === "group") {
      room = `group_${targetId}`;
    } else {
      const ids = [userId, targetId].sort();
      room = `chat_${ids[0]}_${ids[1]}`;
    }
    socket.to(room).emit("stopTyping", { userId, chatKey });
    logger.info(
      `Broadcasting stopTyping to room ${room}: userId=${userId}, chatKey=${chatKey}`
    );
  }

  public async handleMarkAsRead(
    socket: Socket,
    data: MarkAsReadData
  ): Promise<void> {
    try {
      const { chatKey, userId, type } = data;
      const updatedMessages = await this.chatRepo.markMessagesAsRead(
        chatKey,
        userId,
        type
      );
      const notifications = await this.notificationService.getNotifications(
        userId
      );
      const messageNotifications = notifications.filter(
        (n) =>
          n.type === "message" &&
          n.relatedId === chatKey &&
          n.status === "unread"
      );

      for (const notification of messageNotifications) {
        const updatedNotification =
          await this.notificationService.markNotificationAsRead(
            notification._id.toString()
          );
        if (updatedNotification && this.io) {
          this.io
            .to(`user_${userId}`)
            .emit("notification.read", { notificationId: notification._id });
        }
      }

      let room: string;
      if (type === "group") {
        room = `group_${chatKey.replace("group_", "")}`;
      } else {
        const contact = await this.contactsRepo.findContactByUsers(
          userId,
          chatKey.replace(/^(user-mentor_|user-user_)/, "")
        );
        const ids = [
          contact?.userId.toString(),
          contact?.targetUserId?.toString(),
        ].sort();
        room = `chat_${ids[0]}_${ids[1]}`;
      }

      this.io
        ?.to(room)
        .emit("messagesRead", { chatKey, userId, messageIds: updatedMessages });
      logger.info(
        `Marked messages as read for user ${userId} in chat ${chatKey}`
      );
    } catch (error: any) {
      logger.error(`Error marking messages as read: ${error.message}`);
      socket.emit("error", { message: "Failed to mark messages as read" });
    }
  }
  public handleLeaveChat(userId: string): void {
    this.activeChats.delete(userId);
    logger.info(`User ${userId} left active chat`);
  }
}
