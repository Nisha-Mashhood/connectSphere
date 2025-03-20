import cron from "node-cron";
import * as notificationService from "../services/notification.service.js";
import { getAllTasksForNotification } from "../repositories/notification.repositry.js";
import mongoose from "mongoose";
// Function to convert 12-hour format to 24-hour format
const convertTo24HourFormat = (time12h) => {
    const match = time12h.match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/i);
    if (!match)
        return null;
    let hours = parseInt(match[1]); // Convert extracted string to number
    const minutes = parseInt(match[2]);
    const period = match[3].toUpperCase();
    if (period === "PM" && hours !== 12)
        hours += 12;
    if (period === "AM" && hours === 12)
        hours = 0;
    return { hours, minutes };
};
// Schedule push notifications
export const scheduleNotifications = () => {
    cron.schedule("* * * * *", async () => {
        console.log("Checking for notifications...");
        const currentTime = new Date();
        try {
            // Fetch tasks that are due for notification
            const tasks = await getAllTasksForNotification();
            if (tasks.length === 0) {
                console.log("No tasks require notifications.");
                return;
            }
            for (const task of tasks) {
                // Skip tasks without notification date or time
                if (!task.notificationDate || !task.notificationTime) {
                    console.warn(`Skipping task ${task.name}: Missing notification details.`);
                    continue;
                }
                const taskNotificationTime = new Date(task.notificationDate);
                const notificationTime = String(task.notificationTime ?? "00:00 AM");
                const time24 = convertTo24HourFormat(notificationTime);
                if (!time24) {
                    console.warn(`Skipping task ${task.name}: Invalid notification time format.`);
                    continue;
                }
                taskNotificationTime.setHours(time24.hours, time24.minutes, 0, 0);
                // Check if current time matches or exceeds task notification time
                if (currentTime >= taskNotificationTime) {
                    const subscriptionWithUserId = task.notificationSubscription;
                    if (subscriptionWithUserId && subscriptionWithUserId.userId) {
                        try {
                            const taskId = task._id instanceof mongoose.Types.ObjectId
                                ? task._id.toString()
                                : String(task._id);
                            await notificationService.sendPushNotification(taskId, `Reminder: ${task.name} is due soon!`, subscriptionWithUserId.userId);
                        }
                        catch (notificationError) {
                            console.error(`Failed to send notification for task ${task.name}:`, notificationError);
                        }
                    }
                    else {
                        console.warn(`No user ID found in subscription for task ${task.name}`);
                    }
                }
                if (currentTime > new Date(task.dueDate)) {
                    console.log(`Task ${task.name} is past due. Stopping notifications.`);
                }
            }
        }
        catch (error) {
            console.error("❌ Error checking tasks for notifications:", error);
        }
    });
    console.log("✅ Notification scheduler started.");
};
//# sourceMappingURL=node-cron.utils.js.map