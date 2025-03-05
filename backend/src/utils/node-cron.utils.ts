import cron from "node-cron";
import * as notificationService from "../services/notification.service.js";
import { getAllTasksForNotification } from "../repositories/notification.repositry.js";
import mongoose from "mongoose";

// Type definition for notification subscription
interface NotificationSubscription {
  endpoint: string;
  keys: {
    auth: string;
    p256dh: string;
  };
  userId?: string; // Add optional userId
}

// Function to convert 12-hour format to 24-hour format
const convertTo24HourFormat = (time12h: string): { hours: number; minutes: number } | null => {
  const match = time12h.match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/i);
  if (!match) return null;

  let hours = parseInt(match[1]);  // Convert extracted string to number
  const minutes = parseInt(match[2]); 
  const period = match[3].toUpperCase();

  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;

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

        // Ensure notificationTime exists and is properly formatted
        const notificationTime: string = String(task.notificationTime ?? "00:00 AM");
        const time24 = convertTo24HourFormat(notificationTime);
        if (!time24) {
          console.warn(`Skipping task ${task.name}: Invalid notification time format.`);
          continue;
        }

        taskNotificationTime.setHours(time24.hours, time24.minutes, 0, 0);

        // Check if current time matches or exceeds task notification time
        if (currentTime >= taskNotificationTime) {
          // Type-safe extraction of userId
          const subscriptionWithUserId = task.notificationSubscription as NotificationSubscription;
          
          if (subscriptionWithUserId && subscriptionWithUserId.userId) {
            try {
              // Explicitly convert _id to string using mongoose.Types.ObjectId method
              const taskId = task._id instanceof mongoose.Types.ObjectId 
                ? task._id.toString() 
                : String(task._id);

              await notificationService.sendPushNotification(
                taskId, 
                `Reminder: ${task.name} is due soon!`, 
                subscriptionWithUserId.userId
              );
            } catch (notificationError) {
              console.error(`Failed to send notification for task ${task.name}:`, notificationError);
            }
          } else {
            console.warn(`No user ID found in subscription for task ${task.name}`);
          }
        }

        // Optional: Stop notifications when task is completed or due date is passed
        if (currentTime > new Date(task.dueDate)) {
          console.log(`Task ${task.name} is past due. Stopping notifications.`);
        }
      }
    } catch (error) {
      console.error("❌ Error checking tasks for notifications:", error);
    }
  });

  console.log("✅ Notification scheduler started.");
};