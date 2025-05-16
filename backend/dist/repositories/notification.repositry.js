import { Task } from "../models/task.modal.js";
import collaboration from "../models/collaboration.js";
import Group from "../models/group.model.js";
import { AppNotificationModel } from "../models/notification.modal.js";
import userConnectionModal from "../models/userConnection.modal.js";
//Get task details for notifications
export const getTasksForNotification = async (taskId) => {
    const now = new Date();
    return await Task.findOne({
        _id: taskId,
        status: { $ne: "completed" },
        dueDate: { $gte: now },
        notificationDate: { $lte: now },
    });
};
//Get tasks that need notifications
export const getAllTasksForNotification = async () => {
    const now = new Date();
    return await Task.find({
        status: { $ne: "completed" }, // Task should not be completed
        dueDate: { $gte: now }, // Due date is not passed
        notificationDate: { $lte: now }, // Notification date has arrived
        notificationTime: { $exists: true } // Ensure notificationTime is set
    });
};
export const getGroupMembers = async (groupId) => {
    const group = await Group.findById(groupId);
    return group ? group.members : [];
};
export const getMentorIdAndUserId = async (collaborationId) => {
    const collaborationData = await collaboration
        .findById(collaborationId)
        .populate({
        path: "mentorId",
        select: "userId"
    })
        .select("userId mentorId");
    if (!collaborationData)
        return null;
    return {
        userId: collaborationData.userId.toString(),
        mentorUserId: collaborationData.mentorId?.userId?.toString() || null
    };
};
export const getConnectionUserIds = async (connectionId) => {
    try {
        const connection = await userConnectionModal.findById(connectionId).select("requester recipient");
        if (!connection) {
            console.log(`No connection found for ID ${connectionId}`);
            return null;
        }
        return {
            requester: connection.requester.toString(),
            recipient: connection.recipient.toString(),
        };
    }
    catch (error) {
        console.error(`Error fetching connection ${connectionId}:`, error);
        return null;
    }
};
// Check for existing task notification to avoid duplicates
export const findTaskNotification = async (userId, taskId, notificationDate, notificationTime) => {
    return await AppNotificationModel.findOne({
        userId,
        type: "task_reminder",
        relatedId: taskId,
        notificationDate: notificationDate ? new Date(notificationDate) : undefined,
        notificationTime,
    });
};
export const updateNotificationStatus = async (notificationId, status) => {
    try {
        const notification = await AppNotificationModel.findByIdAndUpdate(notificationId, { status, updatedAt: new Date() }, { new: true });
        console.log(`Updated notification ${notificationId} status to ${status}`);
        return notification;
    }
    catch (error) {
        console.error("[DEBUG] Error updating notification status:", error);
        return null;
    }
};
export const updateTaskNotifications = async (relatedId, notificationDate, notificationTime) => {
    try {
        const updateData = {
            ...(notificationDate && { notificationDate: new Date(notificationDate) }),
            ...(notificationTime && { notificationTime }),
            updatedAt: new Date(),
        };
        const notifications = await AppNotificationModel.updateMany({ relatedId, type: "task_reminder" }, { $set: updateData });
        console.log(`Updated ${notifications.modifiedCount} notifications for task ${relatedId}`);
        return notifications;
    }
    catch (error) {
        console.error("Error updating task notifications:", error);
        return null;
    }
};
//Notification with socket.io
export const createNotification = async (notification) => {
    return AppNotificationModel.create(notification);
};
export const findNotificationByUserId = async (userId) => {
    return AppNotificationModel.find({ userId, status: 'unread' })
        .sort({ createdAt: -1 })
        .limit(50);
};
export const findNotificationByCallId = async (userId, callId) => {
    return AppNotificationModel.findOne({ userId, callId, type: "incoming_call", status: "unread" });
};
export const updateNotificationToMissed = async (userId, callId, content) => {
    return AppNotificationModel.findOneAndUpdate({ userId, callId, type: "incoming_call", status: "unread" }, { type: "missed_call", content, updatedAt: new Date() }, { new: true });
};
export const markNotificationAsRead = async (notificationId) => {
    return AppNotificationModel.findByIdAndUpdate(notificationId, { status: 'read', updatedAt: new Date() }, { new: true });
};
export const getNotificationUnreadCount = async (userId) => {
    return AppNotificationModel.countDocuments({ userId, status: 'unread' });
};
//# sourceMappingURL=notification.repositry.js.map