import User from "../models/user.model.js";
import { AppNotification } from "../models/notification.modal.js";
import * as notificationRepository from "../repositories/notification.repositry.js";
import webPush from "../utils/webPushUtil.js";

export interface PushSubscription {
  endpoint: string;
  keys: {
    auth: string;
    p256dh: string;
  };
}

interface ExtendedPushSubscription extends PushSubscription {
  userId?: string;
}

//Store subscription details in DB
export const storeSubscription = async (currentUserId: string, taskId: string, subscription: PushSubscription) => {
  if (!subscription || !subscription.endpoint || !subscription.keys) {
    throw new Error("Invalid subscription object");
  }
  return notificationRepository.saveSubscription(taskId, subscription, { userId: currentUserId });
};

// Send push notifications for a specific task and user
export const sendPushNotification = async (
  taskId: string, 
  message?: string, 
  specificUserId?: string
): Promise<void> => {
  try {
    // Get task details
    const task = await notificationRepository.getTasksForNotification(taskId);

    if (!task) {
      console.log("No notifications found for this Task");
      return;
    }

    let recipients: string[] = [];

    // If a specific user ID is provided, use only that user
    if (specificUserId) {
      recipients = [specificUserId];
    } else {
      if (task.contextType === "profile") {
        recipients.push(task.createdBy.toString());
      } else if (task.contextType === "group") {
        const groupMembers = await notificationRepository.getGroupMembers(task.contextId.toString());
        recipients = groupMembers.map(member => member.toString());
      } else if (task.contextType === "collaboration") {
        const collaborationIds = await notificationRepository.getMentorIdAndUserId(task.contextId.toString());
        
        if (collaborationIds) {
          recipients = [collaborationIds.userId, collaborationIds.mentorUserId]
            .filter((id): id is string => id !== null);
        }
      }
    }

    for (const userId of recipients) {
      // Get the subscription for the specific userID
      const taskWithSubscription = await notificationRepository.getUserSubscription(userId);
      if (!taskWithSubscription?.notificationSubscription) continue;

      const subscription = taskWithSubscription.notificationSubscription as ExtendedPushSubscription;

      const payload = JSON.stringify({
        title: `Reminder: ${task.name}`,
        body: message || `Remember to complete "${task.name}"`,
        icon: task.image || "/default-icon.png",
        taskId: task._id
      });

      try {
        await webPush.sendNotification(subscription, payload);
        console.log(`Notification sent for Task: ${task._id} to User: ${userId}`);
      } catch (error) {
        console.error(`Error sending notification for task ${task._id} to user ${userId}:`, error);
      }
    }

  } catch (error) {
    console.error("Error in sendPushNotification:", error);
    throw error;
  }
};


//Socket.io notifications

// Create a notification for a user
export const sendNotification = async (
  userId: string,
  notificationType: AppNotification['type'],
  senderId: string,
  relatedId: string,
  contentType?: string ,// For messages, "text", "image", "video"
  callId?: string
): Promise<AppNotification> => {
  const sender = await User.findById(senderId).select('name');
  let content: string;

  if (notificationType === 'message') {
    content = `New ${contentType || 'text'} message from ${sender?.name || senderId}`;
  } else if (notificationType === 'incoming_call') {
    const callType = contentType || 'call'; // contentType might be "audio" or "video"
    content = `Incoming ${callType} call from ${sender?.name || senderId}`;
  } else {
    content = `Missed ${contentType} call from ${sender?.name}`;
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

export const updateCallNotificationToMissed = async (
  userId: string,
  callId: string,
  content: string
): Promise<AppNotification | null> => {
  const notification = await notificationRepository.updateNotificationToMissed(userId, callId, content);
  return notification;
};

  export const getNotifications = async (userId: string): Promise<AppNotification[]> =>{
    return notificationRepository.findNotificationByUserId(userId);
  }

 export const  markNotificationAsRead =  async(notificationId: string): Promise<AppNotification | null> =>{
  return notificationRepository.markNotificationAsRead(notificationId);
  }

  export const getUnreadCount = async(userId: string): Promise<number> => {
    return notificationRepository.getNotificationUnreadCount(userId);
  }



