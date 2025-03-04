import cron from "node-cron";
import * as notificationService from "../services/notification.service.js";
import * as notificationRepo from "../repositories/notification.repositry.js";

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
      const tasks = await notificationRepo.getTasksForNotification();
      if (!tasks || tasks.length === 0) {
        console.log("No tasks require notifications.");
        return;
      }

      for (const task of tasks) {
        // Skip tasks without notification date
        if (!task.notificationDate) {
          console.warn(`Skipping task ${task.name}: No notification date.`);
          continue;
        }

        const taskNotificationTime = new Date(task.notificationDate);

        // Ensure notificationTime exists and is properly formatted
        const notificationTime: string = String(task.notificationTime ?? "00:00 AM"); // ✅ Fix applied
        const time24 = convertTo24HourFormat(notificationTime);
        if (!time24) {
          console.warn(`Skipping task ${task.name}: Invalid notification time format.`);
          continue;
        }

        taskNotificationTime.setHours(time24.hours, time24.minutes, 0, 0);

        if (currentTime >= taskNotificationTime) {
          await notificationService.sendPushNotification(
            `Reminder: ${task.name} is due soon!`
          );
        }

        // Stop notifications when task is completed or due date is passed
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
