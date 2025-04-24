import { Task } from "../models/task.modal.js";
import collaboration from "../models/collaboration.js";
import Group from "../models/group.model.js";
import { AppNotificationModel } from "../models/notification.modal.js";
//Save subscription to a task
export const saveSubscription = async (taskId, subscription, metadata) => {
    try {
        const task = await Task.findById(taskId);
        if (!task) {
            throw new Error("Task not found");
        }
        // Create a new object that combines subscription and userId
        const subscriptionWithUserId = {
            ...subscription,
            userId: metadata?.userId
        };
        task.notificationSubscription = subscriptionWithUserId;
        await task.save();
        return task;
    }
    catch (error) {
        console.error("Error saving subscription:", error);
        throw error;
    }
};
//Get task details for notifications
export const getTasksForNotification = async (taskId) => {
    const now = new Date();
    return await Task.findOne({
        _id: taskId,
        status: { $ne: "completed" }, // Task should not be completed
        dueDate: { $gte: now }, // Due date is not passed
        notificationDate: { $lte: now }, // Notification date has arrived
        notificationSubscription: { $ne: null }, // Has subscription
    });
};
//Get tasks that need notifications
export const getAllTasksForNotification = async () => {
    const now = new Date();
    return await Task.find({
        status: { $ne: "completed" }, // Task should not be completed
        dueDate: { $gte: now }, // Due date is not passed
        notificationDate: { $lte: now }, // Notification date has arrived
        notificationSubscription: { $ne: null }, // Has subscription
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
export const getUserSubscription = async (userId) => {
    return await Task.findOne({ "notificationSubscription.userId": userId });
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