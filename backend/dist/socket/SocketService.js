import { EventEmitter } from 'events';
import mongoose from 'mongoose';
import logger from '../core/Utils/Logger.js';
import { ContactRepository } from '../Modules/Contact/Repositry/ContactRepositry.js';
import { GroupRepository } from '../Modules/Group/Repositry/GroupRepositry.js';
import { ChatRepository } from '../Modules/Chat/Repositry/ChatRepositry.js';
import { UserRepository } from '../Modules/Auth/Repositry/UserRepositry.js';
import { NotificationService } from '../Modules/Notification/Service/NotificationService.js';
import Group from '../models/group.model.js';
import Collaboration from '../models/collaboration.js';
import UserConnection from '../models/userConnection.modal.js';
export class SocketService {
    io = null;
    notificationEmitter = new EventEmitter();
    sentNotifications = new Set();
    activeOffers = new Map();
    endedCalls = new Set();
    activeChats = new Map(); // userId -> chatKey
    contactsRepo;
    groupRepo;
    chatRepo;
    userRepo;
    notificationService;
    constructor() {
        this.contactsRepo = new ContactRepository();
        this.groupRepo = new GroupRepository();
        this.chatRepo = new ChatRepository();
        this.userRepo = new UserRepository();
        this.notificationService = new NotificationService();
    }
    initialize(io) {
        this.io = io;
        this.notificationService.initializeSocket(io);
        logger.info('Socket.IO server initialized');
        // Subscribe to task notifications
        this.notificationEmitter.on('notification', (notification) => {
            this.emitTaskNotification(notification);
        });
        this.io.on('connection', (socket) => {
            this.handleConnection(socket);
        });
    }
    handleConnection(socket) {
        const userId = socket.handshake.auth.userId;
        socket.data.userId = userId;
        logger.info(`New client connected: socketId=${socket.id}, userId=${userId}, auth=${JSON.stringify(socket.handshake.auth)}`);
        socket.on('joinChats', (userId) => this.handleJoinChats(socket, userId));
        socket.on('joinUserRoom', (userId) => this.handleJoinUserRoom(socket, userId));
        socket.on('activeChat', (data) => this.handleActiveChat(data));
        socket.on('sendMessage', (message) => this.handleSendMessage(socket, message));
        socket.on('typing', (data) => this.handleTyping(socket, data));
        socket.on('stopTyping', (data) => this.handleStopTyping(socket, data));
        socket.on('markAsRead', (data) => this.handleMarkAsRead(socket, data));
        socket.on('offer', (data) => this.handleOffer(socket, data));
        socket.on('answer', (data) => this.handleAnswer(socket, data));
        socket.on('ice-candidate', (data) => this.handleIceCandidate(socket, data));
        socket.on('callEnded', (data) => this.handleCallEnded(socket, data));
        socket.on('notification.read', (data) => this.handleNotificationRead(socket, data));
        socket.on('leaveChat', (userId) => this.handleLeaveChat(userId));
        socket.on('disconnect', () => this.handleDisconnect(socket));
    }
    async handleJoinChats(socket, userId) {
        try {
            const contacts = await this.contactsRepo.findContactsByUserId(userId);
            const rooms = Array.from(new Set(contacts
                .map((contact) => {
                if (contact.type === 'group' && contact.groupId) {
                    return `group_${contact.groupId._id.toString()}`;
                }
                else if (contact.userId && contact.targetUserId) {
                    const ids = [contact.userId._id.toString(), contact.targetUserId._id.toString()].sort();
                    return `chat_${ids[0]}_${ids[1]}`;
                }
                return null;
            })
                .filter(Boolean)));
            socket.join(rooms);
            logger.info(`User ${userId} joined rooms: ${rooms.join(', ')}`);
        }
        catch (error) {
            logger.error(`Error joining chats for user ${userId}: ${error.message}`);
            socket.emit('error', { message: 'Failed to join chats' });
        }
    }
    handleJoinUserRoom(socket, userId) {
        socket.join(`user_${userId}`);
        logger.info(`User ${userId} joined personal room: user_${userId}, socketId=${socket.id}`);
    }
    handleActiveChat(data) {
        const { userId, chatKey } = data;
        this.activeChats.set(userId, chatKey);
        logger.info(`User ${userId} set active chat: ${chatKey}`);
    }
    async handleSendMessage(socket, message) {
        try {
            const { senderId, targetId, type, content, contentType = 'text', collaborationId, userConnectionId, groupId, _id } = message;
            if (!senderId || !targetId || !type || !content) {
                logger.error(`Missing required fields in message: ${JSON.stringify(message)}`);
                socket.emit('error', { message: 'Missing required fields' });
                return;
            }
            const timestamp = new Date();
            const timestampString = timestamp.toISOString();
            let room;
            let savedMessage;
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
                }
                else {
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
            }
            else {
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
                }
                else {
                    const contact = await this.contactsRepo.findContactByUsers(senderId, targetId);
                    const ids = [contact?.userId.toString(), contact?.targetUserId?.toString()].sort();
                    room = `chat_${ids[0]}_${ids[1]}`;
                }
            }
            let recipientIds = [];
            let chatKey = null;
            if (savedMessage.groupId) {
                chatKey = `group_${savedMessage.groupId.toString()}`;
                const group = await Group.findById(savedMessage.groupId);
                if (group) {
                    recipientIds = group.members
                        .filter((member) => member.userId.toString() !== senderId)
                        .map((member) => member.userId.toString());
                }
            }
            else if (savedMessage.collaborationId) {
                chatKey = `user-mentor_${savedMessage.collaborationId.toString()}`;
                const collab = await Collaboration.findById(savedMessage.collaborationId);
                if (collab) {
                    recipientIds = [
                        collab.userId.toString() === senderId ? collab.mentorId.toString() : collab.userId.toString(),
                    ];
                }
            }
            else if (savedMessage.userConnectionId) {
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
                const connectedUserIds = new Set();
                for (const socketId of socketsInRoom) {
                    const s = this.io.sockets.sockets.get(socketId);
                    if (s && s.data.userId) {
                        connectedUserIds.add(s.data.userId);
                    }
                }
                for (const recipientId of recipientIds) {
                    try {
                        const notification = await this.notificationService.sendNotification(recipientId, 'message', senderId, chatKey, contentType);
                        logger.info(`Emitted via notification emitter to user_${recipientId}: ${notification._id}`);
                    }
                    catch (error) {
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
        }
        catch (error) {
            logger.error(`Error sending message: ${error.message}`);
            socket.emit('error', { message: 'Failed to send message' });
        }
    }
    handleTyping(socket, data) {
        const { userId, targetId, type, chatKey } = data;
        let room;
        if (type === 'group') {
            room = `group_${targetId}`;
        }
        else {
            const ids = [userId, targetId].sort();
            room = `chat_${ids[0]}_${ids[1]}`;
        }
        socket.broadcast.to(room).emit('typing', { userId, chatKey });
        logger.info(`Broadcasting typing to room ${room}: userId=${userId}, chatKey=${chatKey}`);
    }
    handleStopTyping(socket, data) {
        const { userId, targetId, type, chatKey } = data;
        let room;
        if (type === 'group') {
            room = `group_${targetId}`;
        }
        else {
            const ids = [userId, targetId].sort();
            room = `chat_${ids[0]}_${ids[1]}`;
        }
        socket.to(room).emit('stopTyping', { userId, chatKey });
        logger.info(`Broadcasting stopTyping to room ${room}: userId=${userId}, chatKey=${chatKey}`);
    }
    async handleMarkAsRead(socket, data) {
        try {
            const { chatKey, userId, type } = data;
            const updatedMessages = await this.chatRepo.markMessagesAsRead(chatKey, userId, type);
            const notifications = await this.notificationService.getNotifications(userId);
            const messageNotifications = notifications.filter((n) => n.type === 'message' && n.relatedId === chatKey && n.status === 'unread');
            for (const notification of messageNotifications) {
                const updatedNotification = await this.notificationService.markNotificationAsRead(notification._id.toString());
                if (updatedNotification && this.io) {
                    this.io.to(`user_${userId}`).emit('notification.read', { notificationId: notification._id });
                }
            }
            let room;
            if (type === 'group') {
                room = `group_${chatKey.replace('group_', '')}`;
            }
            else {
                const contact = await this.contactsRepo.findContactByUsers(userId, chatKey.replace(/^(user-mentor_|user-user_)/, ''));
                const ids = [contact?.userId.toString(), contact?.targetUserId?.toString()].sort();
                room = `chat_${ids[0]}_${ids[1]}`;
            }
            this.io?.to(room).emit('messagesRead', { chatKey, userId, messageIds: updatedMessages });
            logger.info(`Marked messages as read for user ${userId} in chat ${chatKey}`);
        }
        catch (error) {
            logger.error(`Error marking messages as read: ${error.message}`);
            socket.emit('error', { message: 'Failed to mark messages as read' });
        }
    }
    async handleOffer(socket, data) {
        try {
            const { userId, targetId, type, chatKey, offer, callType } = data;
            logger.info(`Received ${callType} offer from ${userId} for chatKey: ${chatKey}`);
            let room;
            let recipientIds = [];
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
            }
            else {
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
            const connectedUserIds = new Set();
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
                    const notification = await this.notificationService.sendNotification(recipientId, 'incoming_call', userId, chatKey, callType, callId);
                    logger.info(`Created call notification for user ${recipientId}: ${notification._id}`);
                }
                catch (error) {
                    logger.warn(`Failed to send call notification to user ${recipientId}: ${error.message}`);
                }
            }
            const endTimeout = setTimeout(async () => {
                const call = this.activeOffers.get(callId);
                if (!call)
                    return;
                const socketsInRoom = await this.io?.in(room).allSockets();
                const connectedUserIds = new Set();
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
                        const notification = await this.notificationService.updateCallNotificationToMissed(recipientId, callId, `Missed ${callType} call from ${userId}`);
                        if (notification && this.io) {
                            this.io.to(`user_${recipientId}`).emit('notification.updated', notification);
                        }
                        else {
                            logger.info(`No incoming call notification found for call ${callId}, creating new`);
                            const newNotification = await this.notificationService.sendNotification(recipientId, 'missed_call', userId, chatKey, callType, callId);
                            logger.info(`Emitted notification.new to user_${recipientId}: ${newNotification._id}`);
                        }
                    }
                }
                socket.to(room).emit('callEnded', { userId, targetId, type, chatKey, callType });
                socket.emit('callEnded', { userId, targetId, type, chatKey, callType });
                this.activeOffers.delete(callId);
            }, 30000);
            this.activeOffers.set(callId, { senderId: userId, targetId, type, chatKey, callType, recipientIds, endTimeout });
        }
        catch (error) {
            logger.error(`Error broadcasting offer: ${error.message}`);
            socket.emit('error', { message: 'Failed to send offer' });
        }
    }
    async handleAnswer(socket, data) {
        try {
            const { userId, targetId, type, chatKey, answer, callType } = data;
            logger.info(`Received ${callType} answer from ${userId} for chatKey: ${chatKey}`);
            let room;
            if (type === 'group') {
                room = `group_${targetId}`;
            }
            else {
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
            const callId = Array.from(this.activeOffers.keys()).find((id) => this.activeOffers.get(id)?.chatKey === chatKey && this.activeOffers.get(id)?.senderId === targetId);
            if (callId) {
                const call = this.activeOffers.get(callId);
                if (call) {
                    clearTimeout(call.endTimeout);
                    this.activeOffers.delete(callId);
                }
            }
        }
        catch (error) {
            logger.error(`Error broadcasting answer: ${error.message}`);
            socket.emit('error', { message: 'Failed to send answer' });
        }
    }
    async handleIceCandidate(socket, data) {
        try {
            const { userId, targetId, type, chatKey, candidate, callType } = data;
            logger.info(`Received ${callType} ICE candidate from ${userId} for chatKey: ${chatKey}`);
            let room;
            if (type === 'group') {
                room = `group_${targetId}`;
            }
            else {
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
        }
        catch (error) {
            logger.error(`Error broadcasting ICE candidate: ${error.message}`);
            socket.emit('error', { message: 'Failed to send ICE candidate' });
        }
    }
    async handleCallEnded(socket, data) {
        try {
            const { userId, targetId, type, chatKey, callType } = data;
            const callId = `${chatKey}_${Date.now()}`;
            if (this.endedCalls.has(callId)) {
                logger.info(`Ignoring duplicate callEnded for callId: ${callId}, chatKey: ${chatKey}`);
                return;
            }
            logger.info(`Received callEnded from ${userId} for chatKey: ${chatKey}, callType: ${callType}`);
            let room;
            if (type === 'group') {
                room = `group_${targetId}`;
            }
            else {
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
            const callIdToClear = Array.from(this.activeOffers.keys()).find((id) => this.activeOffers.get(id)?.chatKey === chatKey && this.activeOffers.get(id)?.senderId === userId);
            if (callIdToClear) {
                const call = this.activeOffers.get(callIdToClear);
                if (call) {
                    clearTimeout(call.endTimeout);
                    this.activeOffers.delete(callIdToClear);
                }
            }
        }
        catch (error) {
            logger.error(`Error handling callEnded: ${error.message}`);
            socket.emit('error', { message: 'Failed to end call' });
        }
    }
    async handleNotificationRead(socket, data) {
        try {
            const { notificationId, userId } = data;
            const notification = await this.notificationService.markNotificationAsRead(notificationId);
            if (notification && this.io) {
                this.io.to(`user_${userId}`).emit('notification.read', { notificationId });
                logger.info(`Notification marked as read: ${notificationId} for user ${userId}`);
            }
        }
        catch (error) {
            logger.error(`Error handling notification.read: ${error.message}`);
            socket.emit('error', { message: 'Failed to mark notification as read' });
        }
    }
    handleLeaveChat(userId) {
        this.activeChats.delete(userId);
        logger.info(`User ${userId} left active chat`);
    }
    handleDisconnect(socket) {
        logger.info(`User disconnected: socketId=${socket.id}, userId=${socket.data.userId}`);
    }
    emitTaskNotification(notification) {
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
//# sourceMappingURL=SocketService.js.map