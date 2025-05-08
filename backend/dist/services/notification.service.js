import User from "../models/user.model.js";
import * as notificationRepository from "../repositories/notification.repositry.js";
import { findUserById } from "../repositories/user.repositry.js";
import { convertTo24HourFormat } from "../utils/helperForNotService.js";
import { notificationEmitter } from "../socket/socket.js";
export const sendTaskNotification = async (taskId, specificUserId) => {
    const notifications = [];
    try {
        const task = await notificationRepository.getTasksForNotification(taskId);
        if (!task) {
            console.log(` No notifications found for task ${taskId}`);
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
        else if (task.contextType === "userconnection") {
            const connectionIds = await notificationRepository.getConnectionUserIds(task.contextId.toString());
            if (connectionIds) {
                recipients = [connectionIds.requester, connectionIds.recipient].filter((id) => id !== null);
            }
        }
        else if (task.contextType === "group") {
            const groupMembers = await notificationRepository.getGroupMembers(task.contextId.toString());
            recipients = groupMembers.map(member => member.toString());
        }
        else if (task.contextType === "profile") {
            recipients = [task.createdBy.toString()];
        }
        console.log(` Task ${taskId} recipients: ${recipients.join(", ")}`);
        const assigner = await findUserById(task.createdBy.toString());
        const assignerName = assigner?.name || "Unknown";
        for (const userId of recipients) {
            const isAssigner = userId === task.createdBy.toString();
            const content = isAssigner
                ? `Task assigned by you: ${task.name}`
                : `Task assigned by ${assignerName}: ${task.name}`;
            const notificationData = {
                userId: userId,
                type: "task_reminder",
                content,
                relatedId: task.taskId,
                senderId: task.createdBy.toString(),
                status: "unread",
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            const notification = await notificationRepository.createNotification(notificationData);
            if (!notification) {
                console.log(` Failed to create notification for user ${userId} on task ${taskId}`);
                continue;
            }
            console.log(` Created notification ${notification._id} for user ${userId}: ${content}`);
            const payload = {
                _id: notification._id.toString(),
                userId: notification.userId.toString(),
                type: notification.type,
                content: notification.content,
                relatedId: notification.relatedId,
                senderId: notification.senderId.toString(),
                status: notification.status,
                createdAt: notification.createdAt,
                updatedAt: notification.updatedAt,
                taskContext: {
                    contextType: task.contextType,
                    contextId: task.contextId.toString(),
                },
            };
            notifications.push(payload);
            notificationEmitter.emit("notification", payload);
        }
        return notifications;
    }
    catch (error) {
        console.error(` Error in sendPushNotification for task ${taskId}:`, error);
        throw error;
    }
};
export const checkAndSendNotifications = async () => {
    const allNotifications = [];
    try {
        const tasks = await notificationRepository.getAllTasksForNotification();
        const currentTime = new Date();
        console.log(`Checking ${tasks.length} tasks for notifications`);
        for (const task of tasks) {
            if (!task.notificationDate || !task.notificationTime) {
                console.log(`Skipping task ${task.taskId}: Missing notification details`);
                continue;
            }
            const taskNotificationTime = new Date(task.notificationDate);
            const time24 = convertTo24HourFormat(task.notificationTime);
            if (!time24) {
                console.log(`Skipping task ${task.taskId}: Invalid time format ${task.notificationTime}`);
                continue;
            }
            taskNotificationTime.setHours(time24.hours, time24.minutes, 0, 0);
            if ((task.contextType === "collaboration" || task.contextType === "group" || task.contextType === "userconnection") &&
                currentTime >= taskNotificationTime &&
                currentTime <= new Date(task.dueDate) &&
                task.status !== "completed") {
                let recipients = [];
                if (task.contextType === "collaboration") {
                    const collaborationIds = await notificationRepository.getMentorIdAndUserId(task.contextId.toString());
                    if (!collaborationIds) {
                        console.log(`No collaboration found for task ${task.taskId}`);
                        continue;
                    }
                    recipients = [collaborationIds.userId, collaborationIds.mentorUserId].filter((id) => id !== null);
                }
                else if (task.contextType === "group") {
                    const groupMembers = await notificationRepository.getGroupMembers(task.contextId.toString());
                    recipients = groupMembers.map(member => member.toString());
                }
                else if (task.contextType === "userconnection") {
                    const connectionIds = await notificationRepository.getConnectionUserIds(task.contextId.toString());
                    if (!connectionIds) {
                        console.log(`No connection found for task ${task.taskId}`);
                        continue;
                    }
                    recipients = [connectionIds.requester, connectionIds.recipient].filter((id) => id !== null);
                }
                console.log(`Task ${task.taskId} eligible for notification to recipients: ${recipients.join(", ")}`);
                for (const userId of recipients) {
                    const notifications = await sendTaskNotification(task.taskId, userId);
                    allNotifications.push(...notifications);
                    console.log(`Processed notification for task ${task.taskId} to user ${userId}`);
                }
            }
        }
        return allNotifications;
    }
    catch (error) {
        console.error(`Error in checkAndSendNotifications:`, error);
        return allNotifications;
    }
};
// Start periodic checking
setInterval(async () => {
    try {
        const notifications = await checkAndSendNotifications();
        if (notifications.length > 0) {
            console.log(`[DEBUG] Generated ${notifications.length} notifications`);
        }
    }
    catch (error) {
        console.error(`[DEBUG] Error in periodic notification check:`, error);
    }
}, 60000);
// Create a notification for a user
export const sendNotification = async (userId, notificationType, senderId, relatedId, contentType, // For messages, "text", "image", "video"
callId) => {
    const sender = await User.findById(senderId).select('name');
    let content;
    if (notificationType === 'message') {
        content = `New ${contentType || 'text'} message from ${sender?.name || senderId}`;
    }
    else if (notificationType === 'incoming_call') {
        const callType = contentType || 'call'; // contentType might be "audio" or "video"
        content = `Incoming ${callType} call from ${sender?.name || senderId}`;
    }
    else if (notificationType === 'missed_call') {
        content = `Missed ${contentType || 'call'} call from ${sender?.name || senderId}`;
    }
    else if (notificationType === 'task_reminder') {
        const task = await notificationRepository.getTasksForNotification(relatedId);
        if (!task) {
            content = `Task reminder from ${sender?.name || senderId}`;
        }
        else {
            const isAssigner = userId === senderId;
            content = isAssigner
                ? `Task assigned by you: ${task.name}`
                : `Task assigned by ${sender?.name || senderId}: ${task.name}`;
        }
    }
    else {
        content = `Notification from ${sender?.name || senderId}`;
    }
    const notification = await notificationRepository.createNotification({
        userId,
        type: notificationType,
        content,
        relatedId,
        senderId,
        status: 'unread',
        callId,
        createdAt: new Date(),
        updatedAt: new Date(),
    });
    console.log("Created Notification from service file :", notification);
    return notification;
};
export const updateCallNotificationToMissed = async (userId, callId, content) => {
    const notification = await notificationRepository.updateNotificationToMissed(userId, callId, content);
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