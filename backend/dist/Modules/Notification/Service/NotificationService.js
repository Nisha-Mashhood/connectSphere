import { BaseService } from '../../../core/Services/BaseService.js';
import { ServiceError } from '../../../core/Utils/ErrorHandler.js';
import logger from '../../../core/Utils/Logger.js';
import { NotificationRepository } from '../Repositry/NotificationRepositry.js';
import { UserRepository } from '../../Auth/Repositry/UserRepositry.js';
import { notificationEmitter } from '../../../socket/socket.js';
import { convertTo24HourFormat } from '../Utils/Helper.js';
let io = null;
export class NotificationService extends BaseService {
    notificationRepo;
    userRepo;
    constructor() {
        super();
        this.notificationRepo = new NotificationRepository();
        this.userRepo = new UserRepository();
    }
    initializeSocket(_io) {
        io = _io;
        logger.info('Notification service initialized with Socket.IO');
    }
    sendTaskNotification = async (taskId, specificUserId, notificationDate, notificationTime) => {
        try {
            logger.debug(`Sending task notification for task: ${taskId}`);
            const notifications = [];
            const task = await this.notificationRepo.getTasksForNotification(taskId);
            if (!task) {
                logger.warn(`No task found for ID ${taskId}`);
                return notifications;
            }
            const currentTime = new Date();
            if (task.status === 'completed') {
                logger.info(`Skipping task ${task.taskId}: Task completed`);
                return notifications;
            }
            if (new Date(task.dueDate) < currentTime) {
                logger.info(`Skipping task ${task.taskId}: Due date passed (${task.dueDate})`);
                return notifications;
            }
            let isTimeToNotify = false;
            if (task.notificationDate && task.notificationTime) {
                const taskNotificationDate = new Date(task.notificationDate);
                const isSameDay = currentTime.getDate() === taskNotificationDate.getDate() &&
                    currentTime.getMonth() === taskNotificationDate.getMonth() &&
                    currentTime.getFullYear() === taskNotificationDate.getFullYear();
                if (isSameDay) {
                    const time24 = convertTo24HourFormat(task.notificationTime);
                    if (time24) {
                        const taskNotificationTime = new Date(currentTime);
                        taskNotificationTime.setHours(time24.hours, time24.minutes, 0, 0);
                        const timeDiff = Math.abs(currentTime.getTime() - taskNotificationTime.getTime());
                        isTimeToNotify = timeDiff <= 60 * 1000; // ±1 minute window
                    }
                }
            }
            else {
                logger.warn(`Task ${task.taskId} missing notificationDate or notificationTime`);
                return notifications;
            }
            if (!isTimeToNotify) {
                logger.info(`Skipping task ${task.taskId}: Not time to notify`);
                return notifications;
            }
            let recipients = [];
            if (specificUserId) {
                recipients = [specificUserId];
            }
            else if (task.contextType === 'collaboration') {
                const collaborationIds = await this.notificationRepo.getMentorIdAndUserId(task.contextId.toString());
                if (collaborationIds) {
                    recipients = [collaborationIds.userId, collaborationIds.mentorUserId].filter((id) => id !== null);
                }
            }
            else if (task.contextType === 'group') {
                const groupMembers = await this.notificationRepo.getGroupMembers(task.contextId.toString());
                recipients = groupMembers.map(member => member.toString());
            }
            else if (task.contextType === 'profile') {
                recipients = [task.createdBy.toString(), ...task.assignedUsers.map(id => id.toString())];
                recipients = [...new Set(recipients)];
            }
            if (recipients.length === 0) {
                logger.warn(`No recipients for task ${task.taskId}`);
                return notifications;
            }
            const assigner = await this.userRepo.findById(task.createdBy.toString());
            const assignerName = assigner?.name || 'Unknown';
            for (const userId of recipients) {
                let isConnected = false;
                if (io) {
                    const room = `user_${userId}`;
                    const socketsInRoom = await io.in(room).allSockets();
                    isConnected = socketsInRoom.size > 0;
                    logger.debug(`User ${userId} connected for task ${task.taskId}: ${isConnected}`);
                }
                let notification = await this.notificationRepo.findTaskNotification(userId, task._id.toString(), notificationDate, notificationTime);
                if (notification && notification.status === 'read') {
                    notification = await this.notificationRepo.updateNotificationStatus(notification._id.toString(), 'unread');
                }
                if (!notification) {
                    const isAssigner = userId === task.createdBy.toString();
                    const content = isAssigner
                        ? `Reminder: Your task "${task.name}" is due soon`
                        : `Reminder: Task "${task.name}" assigned by ${assignerName} is due soon`;
                    const notificationData = {
                        userId,
                        type: 'task_reminder',
                        content,
                        relatedId: task._id.toString(),
                        senderId: task.createdBy,
                        status: 'unread',
                        notificationDate: notificationDate ? new Date(notificationDate) : undefined,
                        notificationTime,
                        taskContext: {
                            contextType: task.contextType,
                            contextId: task.contextId.toString(),
                        },
                    };
                    notification = await this.notificationRepo.createNotification(notificationData);
                    if (!notification) {
                        logger.warn(`Failed to create notification for user ${userId} on task ${taskId}`);
                        continue;
                    }
                }
                const payload = {
                    _id: notification._id.toString(),
                    userId: notification.userId.toString(),
                    type: notification.type,
                    content: notification.content,
                    relatedId: notification.relatedId,
                    senderId: notification.senderId.toString(),
                    status: notification.status,
                    callId: notification.callId,
                    notificationDate: notification.notificationDate?.toISOString().split('T')[0],
                    notificationTime: notification.notificationTime,
                    createdAt: notification.createdAt,
                    updatedAt: notification.updatedAt,
                    taskContext: notification.taskContext,
                };
                notifications.push(payload);
                if (isConnected && io) {
                    notificationEmitter.emit('notification', payload);
                    logger.info(`Emitted notification ${notification._id} to user ${userId} for task ${task.taskId}`);
                }
                else {
                    logger.info(`Stored notification ${notification._id} for offline user ${userId} on task ${task.taskId}`);
                }
            }
            return notifications;
        }
        catch (error) {
            logger.error(`Error sending task notification: ${error.message}`);
            throw new ServiceError(`Error sending task notification: ${error.message}`);
        }
    };
    checkAndSendNotifications = async () => {
        try {
            logger.debug('Checking and sending notifications');
            const allNotifications = [];
            const tasks = await this.notificationRepo.getAllTasksForNotification();
            const currentTime = new Date();
            for (const task of tasks) {
                if (!task.notificationDate || !task.notificationTime || task.status === 'completed' || new Date(task.dueDate) < currentTime) {
                    continue;
                }
                const notifications = await this.sendTaskNotification(task._id.toString(), undefined, task.notificationDate.toISOString().split('T')[0], task.notificationTime);
                allNotifications.push(...notifications);
            }
            return allNotifications;
        }
        catch (error) {
            logger.error(`Error checking and sending notifications: ${error.message}`);
            throw new ServiceError(`Error checking and sending notifications: ${error.message}`);
        }
    };
    sendNotification = async (userId, notificationType, senderId, relatedId, contentType, callId) => {
        try {
            logger.debug(`Sending notification to user: ${userId}, type: ${notificationType}`);
            this.checkData({ userId, notificationType, senderId, relatedId });
            const sender = await this.userRepo.findById(senderId);
            let content;
            if (notificationType === 'message') {
                content = `New ${contentType || 'text'} message from ${sender?.name || senderId}`;
            }
            else if (notificationType === 'incoming_call') {
                content = `Incoming ${contentType || 'call'} call from ${sender?.name || senderId}`;
            }
            else if (notificationType === 'missed_call') {
                content = `Missed ${contentType || 'call'} call from ${sender?.name || senderId}`;
            }
            else {
                const task = await this.notificationRepo.getTasksForNotification(relatedId);
                if (!task) {
                    content = `Task reminder from ${sender?.name || senderId}`;
                }
                else {
                    const isAssigner = userId === senderId;
                    content = isAssigner
                        ? `Reminder: Your task "${task.name}" is due soon`
                        : `Reminder: Task "${task.name}" assigned by ${sender?.name || senderId} is due soon`;
                }
            }
            const notificationData = {
                userId,
                type: notificationType,
                content,
                relatedId,
                senderId,
                status: 'unread',
                callId,
            };
            const notification = await this.notificationRepo.createNotification(notificationData);
            if (io) {
                const socketsInRoom = await io.in(`user_${userId}`).allSockets();
                if (socketsInRoom.size > 0) {
                    const payload = {
                        _id: notification._id.toString(),
                        userId: notification.userId.toString(),
                        type: notification.type,
                        content: notification.content,
                        relatedId: notification.relatedId,
                        senderId: notification.senderId.toString(),
                        status: notification.status,
                        callId: notification.callId,
                        notificationDate: notification.notificationDate?.toISOString().split('T')[0],
                        notificationTime: notification.notificationTime,
                        createdAt: notification.createdAt,
                        updatedAt: notification.updatedAt,
                        taskContext: notification.taskContext,
                    };
                    notificationEmitter.emit('notification', payload);
                    logger.info(`Emitted notification ${notification._id} to user ${userId}`);
                }
            }
            return notification;
        }
        catch (error) {
            logger.error(`Error sending notification: ${error.message}`);
            throw new ServiceError(`Error sending notification: ${error.message}`);
        }
    };
    updateCallNotificationToMissed = async (userId, callId, content) => {
        try {
            logger.debug(`Updating call notification to missed for user: ${userId}, call: ${callId}`);
            this.checkData({ userId, callId, content });
            const notification = await this.notificationRepo.updateNotificationToMissed(userId, callId, content);
            if (notification && io) {
                const payload = {
                    _id: notification._id.toString(),
                    userId: notification.userId.toString(),
                    type: notification.type,
                    content: notification.content,
                    relatedId: notification.relatedId,
                    senderId: notification.senderId.toString(),
                    status: notification.status,
                    callId: notification.callId,
                    notificationDate: notification.notificationDate?.toISOString().split('T')[0],
                    notificationTime: notification.notificationTime,
                    createdAt: notification.createdAt,
                    updatedAt: notification.updatedAt,
                    taskContext: notification.taskContext,
                };
                notificationEmitter.emit('notification.updated', payload);
            }
            return notification;
        }
        catch (error) {
            logger.error(`Error updating call notification to missed: ${error.message}`);
            throw new ServiceError(`Error updating call notification to missed: ${error.message}`);
        }
    };
    getNotifications = async (userId) => {
        try {
            logger.debug(`Fetching notifications for user: ${userId}`);
            this.checkData(userId);
            return await this.notificationRepo.findNotificationByUserId(userId);
        }
        catch (error) {
            logger.error(`Error fetching notifications: ${error.message}`);
            throw new ServiceError(`Error fetching notifications: ${error.message}`);
        }
    };
    markNotificationAsRead = async (notificationId) => {
        try {
            logger.debug(`Marking notification as read: ${notificationId}`);
            this.checkData(notificationId);
            return await this.notificationRepo.markNotificationAsRead(notificationId);
        }
        catch (error) {
            logger.error(`Error marking notification as read: ${error.message}`);
            throw new ServiceError(`Error marking notification as read: ${error.message}`);
        }
    };
    getUnreadCount = async (userId) => {
        try {
            logger.debug(`Fetching unread notification count for user: ${userId}`);
            this.checkData(userId);
            return await this.notificationRepo.getNotificationUnreadCount(userId);
        }
        catch (error) {
            logger.error(`Error fetching unread notification count: ${error.message}`);
            throw new ServiceError(`Error fetching unread notification count: ${error.message}`);
        }
    };
}
//# sourceMappingURL=NotificationService.js.map