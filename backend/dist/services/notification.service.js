import * as notificationRepository from "../repositories/notification.repositry.js";
import webPush from "../utils/webPushUtil.js";
//Store subscription details in DB
export const storeSubscription = async (currentUserId, taskId, subscription) => {
    if (!subscription || !subscription.endpoint || !subscription.keys) {
        throw new Error("Invalid subscription object");
    }
    return notificationRepository.saveSubscription(taskId, subscription, { userId: currentUserId });
};
// Send push notifications for a specific task and user
export const sendPushNotification = async (taskId, message, specificUserId) => {
    try {
        // Get task details
        const task = await notificationRepository.getTasksForNotification(taskId);
        if (!task) {
            console.log("No notifications found for this Task");
            return;
        }
        let recipients = [];
        // If a specific user ID is provided, use only that user
        if (specificUserId) {
            recipients = [specificUserId];
        }
        else {
            if (task.contextType === "profile") {
                recipients.push(task.createdBy.toString());
            }
            else if (task.contextType === "group") {
                const groupMembers = await notificationRepository.getGroupMembers(task.contextId.toString());
                recipients = groupMembers.map(member => member.toString());
            }
            else if (task.contextType === "collaboration") {
                const collaborationIds = await notificationRepository.getMentorIdAndUserId(task.contextId.toString());
                if (collaborationIds) {
                    recipients = [collaborationIds.userId, collaborationIds.mentorUserId]
                        .filter((id) => id !== null);
                }
            }
        }
        for (const userId of recipients) {
            // Get the subscription for the specific userID
            const taskWithSubscription = await notificationRepository.getUserSubscription(userId);
            if (!taskWithSubscription?.notificationSubscription)
                continue;
            const subscription = taskWithSubscription.notificationSubscription;
            const payload = JSON.stringify({
                title: `Reminder: ${task.name}`,
                body: message || `Remember to complete "${task.name}"`,
                icon: task.image || "/default-icon.png",
                taskId: task._id
            });
            try {
                await webPush.sendNotification(subscription, payload);
                console.log(`Notification sent for Task: ${task._id} to User: ${userId}`);
            }
            catch (error) {
                console.error(`Error sending notification for task ${task._id} to user ${userId}:`, error);
            }
        }
    }
    catch (error) {
        console.error("Error in sendPushNotification:", error);
        throw error;
    }
};
//# sourceMappingURL=notification.service.js.map