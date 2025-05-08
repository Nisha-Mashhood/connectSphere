import User from "../models/user.model.js";
import { AppNotification } from "../models/notification.modal.js";
import * as notificationRepository from "../repositories/notification.repositry.js";
import { findUserById } from "../repositories/user.repositry.js";
import { convertTo24HourFormat } from "../utils/helperForNotService.js";
import { ITask } from "../models/task.modal.js";
import { notificationEmitter } from "../socket/socket.js";


export interface TaskNotificationPayload {
  _id: string;
  userId: string;
  type: "message" | "incoming_call" | "missed_call" | "task_reminder";
  content: string;
  relatedId: string;
  senderId: string;
  status: "unread" | "read";
  notificationDate?: string;
  notificationTime?: string;
  createdAt: Date;
  updatedAt: Date;
  taskContext: {
    contextType: "profile" | "group" | "collaboration" | "userconnection";
    contextId: string;
  };
}

export const sendTaskNotification = async (
  taskId: string,
  specificUserId?: string,
  notificationDate?: string,
  notificationTime?: string
): Promise<TaskNotificationPayload[]> => {
  const notifications: TaskNotificationPayload[] = [];
  try {
    const task: ITask | null = await notificationRepository.getTasksForNotification(taskId);
    if (!task) {
      console.log(`No notifications found for task ${taskId}`);
      return notifications;
    }

    let recipients: string[] = [];
    if (specificUserId) {
      recipients = [specificUserId];
    } else if (task.contextType === "collaboration") {
      const collaborationIds = await notificationRepository.getMentorIdAndUserId(task.contextId.toString());
      if (collaborationIds) {
        recipients = [collaborationIds.userId, collaborationIds.mentorUserId].filter(
          (id): id is string => id !== null
        );
      }
    } else if (task.contextType === "userconnection") {
      const connectionIds = await notificationRepository.getConnectionUserIds(task.contextId.toString());
      if (connectionIds) {
        recipients = [connectionIds.requester, connectionIds.recipient].filter(
          (id): id is string => id !== null
        );
      }
    } else if (task.contextType === "group") {
      const groupMembers = await notificationRepository.getGroupMembers(task.contextId.toString());
      recipients = groupMembers.map(member => member.toString());
    } else if (task.contextType === "profile") {
      recipients = [task.createdBy.toString()];
    }

    console.log(`Task ${taskId} recipients: ${recipients.join(", ")}`);

    const assigner = await findUserById(task.createdBy.toString());
    const assignerName = assigner?.name || "Unknown";

    const currentTime = new Date();
    let shouldEmit = false;
    if (notificationDate && notificationTime) {
      const taskNotificationTime = new Date(notificationDate);
      const time24 = convertTo24HourFormat(notificationTime);
      if (time24) {
        taskNotificationTime.setHours(time24.hours, time24.minutes, 0, 0);
        // Emit only if current time is within a 1-minute window of notification time
        const timeDiff = Math.abs(currentTime.getTime() - taskNotificationTime.getTime());
        shouldEmit = timeDiff <= 60000; // 1 minute
      }
    } else {
      shouldEmit = true; // Immediate notification if no date/time specified
    }

    for (const userId of recipients) {
      // Check for existing notification to avoid duplicates
      const existingNotification = await notificationRepository.findTaskNotification(
        userId,
        task.taskId,
        notificationDate,
        notificationTime
      );

      if (existingNotification) {
        console.log(`Notification already exists for task ${task.taskId} to user ${userId}`);
        continue;
      }

      const isAssigner = userId === task.createdBy.toString();
      const content = isAssigner
        ? `Task assigned by you: ${task.name}`
        : `Task assigned by ${assignerName}: ${task.name}`;

      const notificationData: Omit<AppNotification, "_id"> = {
        userId: userId,
        type: "task_reminder",
        content,
        relatedId: task.taskId,
        senderId: task.createdBy.toString(),
        status: "unread",
        notificationDate: notificationDate ? new Date(notificationDate) : undefined,
        notificationTime,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const notification = await notificationRepository.createNotification(notificationData);
      if (!notification) {
        console.log(`Failed to create notification for user ${userId} on task ${taskId}`);
        continue;
      }

      console.log(`Created notification ${notification._id} for user ${userId}: ${content}`);

      const payload: TaskNotificationPayload = {
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
      if (shouldEmit) {
        notificationEmitter.emit("notification", payload);
      }
    }

    return notifications;
  } catch (error) {
    console.error(`Error in sendTaskNotification for task ${taskId}:`, error);
    throw error;
  }
};

export const checkAndSendNotifications = async (): Promise<TaskNotificationPayload[]> => {
  const allNotifications: TaskNotificationPayload[] = [];
  try {
    const tasks: ITask[] = await notificationRepository.getAllTasksForNotification();
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

      const timeDiff = Math.abs(currentTime.getTime() - taskNotificationTime.getTime());
      if (
        timeDiff <= 60000 && // Within 1-minute window
        (task.contextType === "collaboration" || task.contextType === "group" || task.contextType === "userconnection" || task.contextType === "profile") &&
        currentTime <= new Date(task.dueDate) &&
        task.status !== "completed"
      ) {
        let recipients: string[] = [];
        if (task.contextType === "collaboration") {
          const collaborationIds = await notificationRepository.getMentorIdAndUserId(task.contextId.toString());
          if (!collaborationIds) {
            console.log(`No collaboration found for task ${task.taskId}`);
            continue;
          }
          recipients = [collaborationIds.userId, collaborationIds.mentorUserId].filter(
            (id): id is string => id !== null
          );
        } else if (task.contextType === "group") {
          const groupMembers = await notificationRepository.getGroupMembers(task.contextId.toString());
          recipients = groupMembers.map(member => member.toString());
        } else if (task.contextType === "userconnection") {
          const connectionIds = await notificationRepository.getConnectionUserIds(task.contextId.toString());
          if (!connectionIds) {
            console.log(`No connection found for task ${task.taskId}`);
            continue;
          }
          recipients = [connectionIds.requester, connectionIds.recipient].filter(
            (id): id is string => id !== null
          );
        } else if (task.contextType === "profile") {
          recipients = [task.createdBy.toString()];
        }

        console.log(`Task ${task.taskId} eligible for notification to recipients: ${recipients.join(", ")}`);

        for (const userId of recipients) {
          const notifications = await sendTaskNotification(
            task.taskId,
            userId,
            task.notificationDate.toISOString().split("T")[0],
            task.notificationTime
          );
          allNotifications.push(...notifications);
          console.log(`Processed notification for task ${task.taskId} to user ${userId}`);
        }
      }
    }

    return allNotifications;
  } catch (error) {
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
  } catch (error) {
    console.error(`[DEBUG] Error in periodic notification check:`, error);
  }
}, 60000);

// Create a notification for a user
export const sendNotification = async (
  userId: string,
  notificationType: AppNotification["type"],
  senderId: string,
  relatedId: string,
  contentType?: string, // For messages, "text", "image", "video"
  callId?: string
): Promise<AppNotification> => {
  const sender = await User.findById(senderId).select("name");
  let content: string;

  if (notificationType === "message") {
    content = `New ${contentType || "text"} message from ${sender?.name || senderId}`;
  } else if (notificationType === "incoming_call") {
    const callType = contentType || "call"; // contentType might be "audio" or "video"
    content = `Incoming ${callType} call from ${sender?.name || senderId}`;
  } else if (notificationType === "missed_call") {
    content = `Missed ${contentType || "call"} call from ${sender?.name || senderId}`;
  } else if (notificationType === "task_reminder") {
    const task = await notificationRepository.getTasksForNotification(relatedId);
    if (!task) {
      content = `Task reminder from ${sender?.name || senderId}`;
    } else {
      const isAssigner = userId === senderId;
      content = isAssigner
        ? `Task assigned by you: ${task.name}`
        : `Task assigned by ${sender?.name || senderId}: ${task.name}`;
    }
  } else {
    content = `Notification from ${sender?.name || senderId}`;
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

export const updateCallNotificationToMissed = async (
  userId: string,
  callId: string,
  content: string
): Promise<AppNotification | null> => {
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

export const getNotifications = async (userId: string): Promise<AppNotification[]> => {
  return notificationRepository.findNotificationByUserId(userId);
};

export const markNotificationAsRead = async (notificationId: string): Promise<AppNotification | null> => {
  return notificationRepository.markNotificationAsRead(notificationId);
};

export const getUnreadCount = async (userId: string): Promise<number> => {
  return notificationRepository.getNotificationUnreadCount(userId);
};