import User from "../models/user.model.js";
import * as notificationRepository from "../repositories/notification.repositry.js";
import { findUserById } from "../repositories/user.repositry.js";
import { convertTo24HourFormat } from "../utils/helperForNotService.js";
import { notificationEmitter } from "../socket/socket.js";
let io; // Store Socket.IO instance
// Initialize Socket.IO instance (called from socket.ts)
export const initializeNotificationService = (_io) => {
    io = _io;
    console.log("Notification service initialized with Socket.IO");
};
export const sendTaskNotification = async (taskId, specificUserId, notificationDate, notificationTime) => {
    const notifications = [];
    try {
        const task = await notificationRepository.getTasksForNotification(taskId);
        if (!task) {
            console.log(`No task found for _id ${taskId}`);
            return notifications;
        }
        // Skip if task is completed or due date has passed
        const currentTime = new Date();
        if (task.status === "completed") {
            console.log(`Skipping task ${task.taskId}: Task completed`);
            return notifications;
        }
        if (new Date(task.dueDate) < currentTime) {
            console.log(`Skipping task ${task.taskId}: Due date passed (${task.dueDate})`);
            return notifications;
        }
        // Check if current time matches notificationDate and notificationTime
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
            console.log(`Task ${task.taskId} missing notificationDate or notificationTime`);
            return notifications;
        }
        if (!isTimeToNotify) {
            console.log(`Skipping task ${task.taskId}: Not time to notify`);
            return notifications;
        }
        let recipients = [];
        if (specificUserId) {
            recipients = [specificUserId];
        }
        else if (task.contextType === "collaboration") {
            const collaborationIds = await notificationRepository.getMentorIdAndUserId(task.contextId.toString());
            if (collaborationIds) {
                recipients = [collaborationIds.userId, collaborationIds.mentorUserId].filter((id) => id !== null);
            }
        }
        else if (task.contextType === "group") {
            const groupMembers = await notificationRepository.getGroupMembers(task.contextId.toString());
            recipients = groupMembers.map(member => member.toString());
        }
        else if (task.contextType === "profile") {
            recipients = [task.createdBy.toString(), ...task.assignedUsers.map(id => id.toString())];
            recipients = [...new Set(recipients)]; // Remove duplicates
        }
        console.log(`Task ${task.taskId} recipients: ${recipients.join(", ")}`);
        if (recipients.length === 0) {
            console.log(`No recipients for task ${task.taskId}`);
            return notifications;
        }
        const assigner = await findUserById(task.createdBy.toString());
        const assignerName = assigner?.name || "Unknown";
        for (const userId of recipients) {
            let isConnected = true;
            if (io) {
                const room = `user_${userId}`;
                const socketsInRoom = await io.in(room).allSockets();
                isConnected = socketsInRoom.size > 0;
                if (!isConnected) {
                    console.log(`Skipping notification for user ${userId} on task ${task.taskId}: User not connected`);
                    continue;
                }
            }
            // Check for existing notification
            let notification = await notificationRepository.findTaskNotification(userId, task._id.toString(), notificationDate, notificationTime);
            if (notification && notification.status === "read") {
                notification = await notificationRepository.updateNotificationStatus(notification._id.toString(), "unread");
            }
            if (!notification) {
                const isAssigner = userId === task.createdBy.toString();
                const content = isAssigner
                    ? `Reminder: Your task "${task.name}" is due soon`
                    : `Reminder: Task "${task.name}" assigned by ${assignerName} is due soon`;
                const notificationData = {
                    userId: userId,
                    type: "task_reminder",
                    content,
                    relatedId: task._id.toString(),
                    senderId: task.createdBy.toString(),
                    status: "unread",
                    notificationDate: notificationDate ? new Date(notificationDate) : undefined,
                    notificationTime,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    taskContext: {
                        contextType: task.contextType,
                        contextId: task.contextId.toString(),
                    },
                };
                notification = await notificationRepository.createNotification(notificationData);
                if (!notification) {
                    console.log(`Failed to create notification for user ${userId} on task ${taskId}`);
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
                notificationDate: notification.notificationDate?.toISOString().split("T")[0],
                notificationTime: notification.notificationTime,
                createdAt: notification.createdAt,
                updatedAt: notification.updatedAt,
                taskContext: {
                    contextType: task.contextType,
                    contextId: task.contextId.toString(),
                },
            };
            notifications.push(payload);
            notificationEmitter.emit("notification", payload);
            console.log(`Emitted notification ${notification._id} to user ${userId} for task ${task.taskId}`);
        }
        return notifications;
    }
    catch (error) {
        console.error(`Error in sendTaskNotification for task ${taskId}:`, error);
        throw error;
    }
};
export const checkAndSendNotifications = async () => {
    const allNotifications = [];
    // console.log("Entering checkAndSendNotifications");
    try {
        const tasks = await notificationRepository.getAllTasksForNotification();
        const currentTime = new Date();
        // console.log(`Checking ${tasks.length} tasks for notifications at ${currentTime}`);
        for (const task of tasks) {
            // console.log(`Processing task ${task.taskId}: status=${task.status}, dueDate=${task.dueDate}`);
            // Skip tasks without notificationDate or notificationTime
            if (!task.notificationDate || !task.notificationTime) {
                // console.log(`Skipping task ${task.taskId}: Missing notificationDate or notificationTime`);
                continue;
            }
            // Skip tasks that are completed or past due
            if (task.status === "completed") {
                // console.log(`Skipping task ${task.taskId}: Task completed`);
                continue;
            }
            if (new Date(task.dueDate) < currentTime) {
                // console.log(`Skipping task ${task.taskId}: Due date passed (${task.dueDate})`);
                continue;
            }
            // Send notification only at the specified time
            const notifications = await sendTaskNotification(task._id.toString(), undefined, task.notificationDate?.toISOString().split("T")[0], task.notificationTime);
            allNotifications.push(...notifications);
            // console.log(`Processed task ${task.taskId}, generated ${notifications.length} notifications`);
        }
        // console.log(`checkAndSendNotifications returning ${allNotifications.length} notifications`);
        return allNotifications;
    }
    catch (error) {
        console.error(`Error in checkAndSendNotifications:`, error);
        return allNotifications;
    }
};
// Start periodic checking every minute
setInterval(async () => {
    try {
        const notifications = await checkAndSendNotifications();
        if (notifications.length > 0) {
            console.log(`Generated ${notifications.length} notifications`);
        }
        else {
            console.log("No notifications generated");
        }
    }
    catch (error) {
        console.error(`Error in periodic notification check:`, error);
    }
}, 60 * 1000); // 1 minute
// Create a notification for a user (for non-task notifications)
export const sendNotification = async (userId, notificationType, senderId, relatedId, contentType, callId) => {
    const sender = await User.findById(senderId).select("name");
    let content;
    if (notificationType === "message") {
        content = `New ${contentType || "text"} message from ${sender?.name || senderId}`;
    }
    else if (notificationType === "incoming_call") {
        const callType = contentType || "call";
        content = `Incoming ${callType} call from ${sender?.name || senderId}`;
    }
    else if (notificationType === "missed_call") {
        content = `Missed ${contentType || "call"} call from ${sender?.name || senderId}`;
    }
    else if (notificationType === "task_reminder") {
        const task = await notificationRepository.getTasksForNotification(relatedId);
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
    else {
        content = `Notification from ${sender?.name || senderId}`;
    }
    // Check if user is connected before creating non-task notifications
    if (io && notificationType !== "task_reminder") {
        const socketsInRoom = await io.in(`user_${userId}`).allSockets();
        if (socketsInRoom.size === 0) {
            console.log(`User ${userId} is not connected, skipping non-task notification`);
            throw new Error(`User ${userId} is not connected`);
        }
    }
    const notification = await notificationRepository.createNotification({
        userId,
        type: notificationType,
        content,
        relatedId,
        senderId,
        status: "unread",
        callId,
        createdAt: new Date(),
        updatedAt: new Date(),
    });
    console.log("Created Notification from service file:", notification);
    notificationEmitter.emit("notification", {
        _id: notification._id.toString(),
        userId: notification.userId.toString(),
        type: notification.type,
        content: notification.content,
        relatedId: notification.relatedId,
        senderId: notification.senderId.toString(),
        status: notification.status,
        createdAt: notification.createdAt,
        updatedAt: notification.updatedAt,
    });
    return notification;
};
export const updateCallNotificationToMissed = async (userId, callId, content) => {
    const notification = await notificationRepository.updateNotificationToMissed(userId, callId, content);
    if (notification) {
        notificationEmitter.emit("notification.updated", {
            _id: notification._id.toString(),
            userId: notification.userId.toString(),
            type: notification.type,
            content: notification.content,
            relatedId: notification.relatedId,
            senderId: notification.senderId.toString(),
            status: notification.status,
            createdAt: notification.createdAt,
            updatedAt: notification.updatedAt,
        });
    }
    return notification;
};
export const getNotifications = async (userId) => {
    return notificationRepository.findNotificationByUserId(userId);
};
export const markNotificationAsRead = async (notificationId) => {
    return notificationRepository.markNotificationAsRead(notificationId);
};
export const getUnreadCount = async (userId) => {
    return notificationRepository.getNotificationUnreadCount(userId);
};
//# sourceMappingURL=notification.service.js.map