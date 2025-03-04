import * as notificationRepository from "../repositories/notification.repositry.js";
import webPush from "../utils/webPushUtil.js";
//Store subscription details in DB
export const storeSubscription = async (taskId, subscription) => {
    // Validate subscription object before storing
    if (!subscription || !subscription.endpoint || !subscription.keys) {
        throw new Error("Invalid subscription object");
    }
    return notificationRepository.saveSubscription(taskId, subscription);
};
;
//Send a push notification
export const sendPushNotification = async (message) => {
    try {
        const tasks = await notificationRepository.getTasksForNotification();
        if (!tasks || tasks.length === 0) {
            console.log("No tasks with subscriptions found");
            return;
        }
        for (const task of tasks) {
            // Validate subscription object before sending
            const subscription = task.notificationSubscription;
            // Validate subscription object before sending
            if (!subscription || !subscription.endpoint || !subscription.keys) {
                console.warn(`Invalid subscription for task: ${task._id}`);
                continue;
            }
            const payload = JSON.stringify({
                title: `Reminder to task "${task.name}"`,
                body: message || `Remember to complete "${task.name}"`,
                icon: task.image || "/default-icon.png",
            });
            try {
                await webPush.sendNotification(subscription, payload);
                console.log(`Notification sent for Task: ${task._id}`);
            }
            catch (error) {
                console.error(`Error sending notification for task ${task._id}:`, error);
            }
        }
    }
    catch (error) {
        console.error("Error in sendPushNotification:", error);
        throw error;
    }
};
//# sourceMappingURL=notification.service.js.map