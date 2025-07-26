import { BaseService } from "../../../core/Services/BaseService";
import { ServiceError } from "../../../core/Utils/ErrorHandler";
import logger from "../../../core/Utils/Logger";
import { NotificationRepository } from "../Repositry/NotificationRepositry";
import { UserRepository } from "../../Auth/Repositry/UserRepositry";
import { AppNotification as IAppNotification } from "../../../Interfaces/models/AppNotification";
import { ITask } from "../../../Interfaces/models/ITask";
import { Server } from "socket.io";
import { SocketService } from "../../../socket/SocketService";
import { convertTo24HourFormat } from "../Utils/Helper";

let io: Server | null = null;

export interface TaskNotificationPayload {
  _id: string;
  userId: string;
  type:
    | "message"
    | "incoming_call"
    | "missed_call"
    | "task_reminder"
    | "new_user"
    | "new_mentor"
    | "mentor_approved"
    | "collaboration_status";
  content: string;
  relatedId: string;
  senderId: string;
  status: "unread" | "read";
  callId?: string;
  notificationDate?: string;
  notificationTime?: string;
  createdAt: Date;
  updatedAt: Date;
  taskContext?: {
    contextType: "profile" | "group" | "collaboration" | "userconnection";
    contextId: string;
  };
}

export class NotificationService extends BaseService {
  private notificationRepo: NotificationRepository;
  private userRepo: UserRepository;
  private intervalId: NodeJS.Timeout | null = null;

  constructor() {
    super();
    this.notificationRepo = new NotificationRepository();
    this.userRepo = new UserRepository();
  }

  initializeSocket(_io: Server) {
    io = _io;
    logger.info("Notification service initialized with Socket.IO");
    this.startNotificationInterval();
  }

  private startNotificationInterval() {
    if (this.intervalId) {
      clearInterval(this.intervalId); // Clear existing interval
      logger.info("Cleared existing notification interval");
    }
    this.intervalId = setInterval(async () => {
      try {
        const notifications = await this.checkAndSendNotifications();
        logger.info(`Generated ${notifications.length} notifications`);
      } catch (error: any) {
        logger.error(`Error in periodic notification check: ${error.message}`);
      }
    }, 60 * 1000); // 1 minute
  }

  stopNotificationInterval() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      logger.info("Notification interval stopped");
    }
  }

  sendTaskNotification = async (
    taskId: string,
    specificUserId?: string,
    notificationDate?: string,
    notificationTime?: string
  ): Promise<TaskNotificationPayload[]> => {
    try {
      logger.debug(`Sending task notification for task: ${taskId}`);
      const notifications: TaskNotificationPayload[] = [];
      const task: ITask | null =
        await this.notificationRepo.getTasksForNotification(taskId);
      if (!task) {
        logger.warn(`No task found for ID ${taskId}`);
        return notifications;
      }
      logger.info(`Task Found For Notification : ${task}`);

      const currentTime = new Date();
      if (task.status === "completed") {
        logger.info(`Skipping task ${task.taskId}: Task completed`);
        return notifications;
      }
      if (new Date(task.dueDate) < currentTime) {
        logger.info(
          `Skipping task ${task.taskId}: Due date passed (${task.dueDate})`
        );
        return notifications;
      }

      let isTimeToNotify = false;
      if (task.notificationDate && task.notificationTime) {
        const taskNotificationDate = new Date(task.notificationDate);
        const isSameDay =
          currentTime.getDate() === taskNotificationDate.getDate() &&
          currentTime.getMonth() === taskNotificationDate.getMonth() &&
          currentTime.getFullYear() === taskNotificationDate.getFullYear();

        if (isSameDay) {
          const time24 = convertTo24HourFormat(task.notificationTime);
          if (time24) {
            const taskNotificationTime = new Date(currentTime);
            taskNotificationTime.setHours(time24.hours, time24.minutes, 0, 0);
            const timeDiff = Math.abs(
              currentTime.getTime() - taskNotificationTime.getTime()
            );
            isTimeToNotify = timeDiff <= 60 * 1000; // ±1 minute window
          }
        }
      } else {
        logger.warn(
          `Task ${task.taskId} missing notificationDate or notificationTime`
        );
        return notifications;
      }

      if (!isTimeToNotify) {
        logger.info(`Skipping task ${task.taskId}: Not time to notify`);
        return notifications;
      }

      let recipients: string[] = [];
      if (specificUserId) {
        recipients = [specificUserId];
      } else if (task.contextType === "collaboration") {
        const collaborationIds =
          await this.notificationRepo.getMentorIdAndUserId(
            task.contextId.toString()
          );
        if (collaborationIds) {
          recipients = [
            collaborationIds.userId,
            collaborationIds.mentorUserId,
          ].filter((id): id is string => id !== null);
        }
      } else if (task.contextType === "group") {
        const groupMembers = await this.notificationRepo.getGroupMembers(
          task.contextId.toString()
        );
        recipients = groupMembers.map((member) => member.toString());
      } else if (task.contextType === "profile") {
        recipients = [
          task.createdBy.toString(),
          ...task.assignedUsers.map((id) => id.toString()),
        ];
        recipients = [...new Set(recipients)];
      }

      logger.debug(
        `Recipients for task ${task._id}: ${JSON.stringify(recipients)}`
      );
      if (recipients.length === 0) {
        logger.warn(`No recipients for task ${task.taskId}`);
        return notifications;
      }

      const assigner = await this.userRepo.findById(task.createdBy.toString());
      const assignerName = assigner?.name || "Unknown";

      for (const userId of recipients) {
        let isConnected = false;
        if (io) {
          const room = `user_${userId}`;
          const socketsInRoom = await io.in(room).allSockets();
          isConnected = socketsInRoom.size > 0;
          logger.debug(
            `User ${userId} connected for task ${task.taskId}: ${isConnected}`
          );
        }

        let notification = await this.notificationRepo.findTaskNotification(
          userId,
          task._id.toString(),
          notificationDate,
          notificationTime
        );

        if (notification && notification.status === "read") {
          notification = await this.notificationRepo.updateNotificationStatus(
            notification._id.toString(),
            "unread"
          );
        }

        if (!notification) {
          const isAssigner = userId === task.createdBy.toString();
          const content = isAssigner
            ? `Reminder: Your task "${task.name}" is due soon`
            : `Reminder: Task "${task.name}" assigned by ${assignerName} is due soon`;

          const notificationData: Partial<IAppNotification> = {
            userId,
            type: "task_reminder",
            content,
            relatedId: task._id.toString(),
            senderId: task.createdBy,
            status: "unread",
            notificationDate: notificationDate
              ? new Date(notificationDate)
              : undefined,
            notificationTime,
            taskContext: {
              contextType: task.contextType,
              contextId: task.contextId.toString(),
            },
          };

          notification = await this.notificationRepo.createNotification(
            notificationData
          );
          if (!notification) {
            logger.warn(
              `Failed to create notification for user ${userId} on task ${taskId}`
            );
            continue;
          }
        }

        const payload: TaskNotificationPayload = {
          _id: notification._id.toString(),
          userId: notification.userId.toString(),
          type: notification.type,
          content: notification.content,
          relatedId: notification.relatedId,
          senderId: notification.senderId.toString(),
          status: notification.status,
          callId: notification.callId,
          notificationDate: notification.notificationDate
            ?.toISOString()
            .split("T")[0],
          notificationTime: notification.notificationTime,
          createdAt: notification.createdAt,
          updatedAt: notification.updatedAt,
          taskContext: notification.taskContext,
        };

        notifications.push(payload);
        if (isConnected && io) {
          SocketService.notificationEmitter.emit("notification", payload);
          logger.info(
            `Emitted notification ${notification._id} to user ${userId} for task ${task.taskId}`
          );
        } else {
          logger.info(
            `Stored notification ${notification._id} for offline user ${userId} on task ${task.taskId}`
          );
        }
      }
      return notifications;
    } catch (error: any) {
      logger.error(`Error sending task notification: ${error.message}`);
      throw new ServiceError(
        `Error sending task notification: ${error.message}`
      );
    }
  };

  checkAndSendNotifications = async (): Promise<TaskNotificationPayload[]> => {
    try {
      logger.debug("Checking and sending notifications");
      const allNotifications: TaskNotificationPayload[] = [];
      const tasks: ITask[] =
        await this.notificationRepo.getAllTasksForNotification();
      const currentTime = new Date();

      for (const task of tasks) {
        if (
          !task.notificationDate ||
          !task.notificationTime ||
          task.status === "completed" ||
          new Date(task.dueDate) < currentTime
        ) {
          continue;
        }
        const notifications = await this.sendTaskNotification(
          task._id.toString(),
          undefined,
          task.notificationDate.toISOString().split("T")[0],
          task.notificationTime
        );
        allNotifications.push(...notifications);
      }

      return allNotifications;
    } catch (error: any) {
      logger.error(
        `Error checking and sending notifications: ${error.message}`
      );
      throw new ServiceError(
        `Error checking and sending notifications: ${error.message}`
      );
    }
  };

  sendNotification = async (
    userId: string,
    notificationType: IAppNotification["type"],
    senderId: string,
    relatedId: string,
    contentType?: string,
    callId?: string,
    customContent?: string
  ): Promise<IAppNotification> => {
    try {
      logger.debug(
        `Sending notification to user: ${userId}, type: ${notificationType}`
      );
      this.checkData({ userId, notificationType, senderId, relatedId });

      const sender = await this.userRepo.findById(senderId);
      let content: string;

      // Use customContent if provided, otherwise generate default content
      if (customContent) {
        content = customContent;
      } else if (notificationType === "message") {
        content = `New ${contentType || "text"} message from ${
          sender?.name || senderId
        }`;
      } else if (notificationType === "incoming_call") {
        content = `Incoming ${contentType || "call"} call from ${
          sender?.name || senderId
        }`;
      } else if (notificationType === "missed_call") {
        content = `Missed ${contentType || "call"} call from ${
          sender?.name || senderId
        }`;
      } else if (notificationType === "new_user") {
        content = `New user registered: ${sender?.email || senderId}`;
      } else if (notificationType === "new_mentor") {
        content = `New mentor registered: ${sender?.email || senderId}`;
      } else if (notificationType === "mentor_approved") {
        content = `Mentor approval status updated for ${
          sender?.email || senderId
        }`;
      } else if (notificationType === "collaboration_status") {
        content = `Collaboration status updated with ${
          sender?.name || senderId
        }`;
      } else {
        const task = await this.notificationRepo.getTasksForNotification(
          relatedId
        );
        if (!task) {
          content = `Task reminder from ${sender?.name || senderId}`;
        } else {
          const isAssigner = userId === senderId;
          content = isAssigner
            ? `Reminder: Your task "${task.name}" is due soon`
            : `Reminder: Task "${task.name}" assigned by ${
                sender?.name || senderId
              } is due soon`;
        }
      }

      const notificationData: Partial<IAppNotification> = {
        userId,
        type: notificationType,
        content,
        relatedId,
        senderId,
        status: "unread",
        callId,
        taskContext: contentType
          ? {
              contextType: contentType as
                | "profile"
                | "group"
                | "collaboration"
                | "userconnection",
              contextId: relatedId,
            }
          : undefined,
      };

      const notification = await this.notificationRepo.createNotification(
        notificationData
      );

      if (io) {
        const socketsInRoom = await io.in(`user_${userId}`).allSockets();
        if (socketsInRoom.size > 0) {
          const payload: TaskNotificationPayload = {
            _id: notification._id.toString(),
            userId: notification.userId.toString(),
            type: notification.type,
            content: notification.content,
            relatedId: notification.relatedId,
            senderId: notification.senderId.toString(),
            status: notification.status,
            callId: notification.callId,
            notificationDate: notification.notificationDate
              ?.toISOString()
              .split("T")[0],
            notificationTime: notification.notificationTime,
            createdAt: notification.createdAt,
            updatedAt: notification.updatedAt,
            taskContext: notification.taskContext,
          };
          SocketService.notificationEmitter.emit("notification", payload);
          logger.info(
            `Emitted notification ${notification._id} to user ${userId}`
          );
        } else {
          logger.info(
            `User ${userId} not connected, stored notification ${notification._id}`
          );
        }
      }

      return notification;
    } catch (error: any) {
      logger.error(`Error sending notification: ${error.message}`);
      throw new ServiceError(`Error sending notification: ${error.message}`);
    }
  };

  updateCallNotificationToMissed = async (
    userId: string,
    callId: string,
    content: string
  ): Promise<IAppNotification | null> => {
    try {
      logger.debug(
        `Updating call notification to missed for user: ${userId}, call: ${callId}`
      );
      this.checkData({ userId, callId, content });

      const notification =
        await this.notificationRepo.updateNotificationToMissed(
          userId,
          callId,
          content
        );
      if (notification && io) {
        const payload: TaskNotificationPayload = {
          _id: notification._id.toString(),
          userId: notification.userId.toString(),
          type: notification.type,
          content: notification.content,
          relatedId: notification.relatedId,
          senderId: notification.senderId.toString(),
          status: notification.status,
          callId: notification.callId,
          notificationDate: notification.notificationDate
            ?.toISOString()
            .split("T")[0],
          notificationTime: notification.notificationTime,
          createdAt: notification.createdAt,
          updatedAt: notification.updatedAt,
          taskContext: notification.taskContext,
        };
        SocketService.notificationEmitter.emit("notification.updated", payload);
      }
      return notification;
    } catch (error: any) {
      logger.error(
        `Error updating call notification to missed: ${error.message}`
      );
      throw new ServiceError(
        `Error updating call notification to missed: ${error.message}`
      );
    }
  };

  getNotifications = async (userId: string): Promise<IAppNotification[]> => {
    try {
      logger.debug(`Fetching notifications for user: ${userId}`);
      this.checkData(userId);
      return await this.notificationRepo.findNotificationByUserId(userId);
    } catch (error: any) {
      logger.error(`Error fetching notifications: ${error.message}`);
      throw new ServiceError(`Error fetching notifications: ${error.message}`);
    }
  };

  // Marks a single notification or all notifications of a specific type as read
  markNotificationAsRead = async (
    notificationId?: string,
    userId?: string,
    type?: IAppNotification["type"]
  ): Promise<IAppNotification[]> => {
    logger.info(
      `markNotificationAsRead called with: notificationId=${notificationId}, userId=${userId}, type=${type}`
    );

    try {
      if (!notificationId && !type) {
        throw new ServiceError(
          "Either notificationId or type must be provided"
        );
      }
      if (type && !userId) {
        throw new ServiceError(
          "userId is required when marking notifications by type"
        );
      }

      const updatedNotifications: IAppNotification[] = [];

      if (notificationId) {
        // Mark a single notification as read by ID
        logger.debug(`Marking single notification as read: ${notificationId}`);
        this.checkData(notificationId);
        const notification = await this.notificationRepo.markNotificationAsRead(
          notificationId
        );
        if (notification) {
          updatedNotifications.push(notification);
          logger.info(`Marked notification ${notificationId} as read`);
        }
      } else if (userId && type) {
        // Mark all notifications of a specific type as read for a user
        logger.debug(
          `Entering type-based marking for user: ${userId}, type: ${type}`
        );
        this.checkData({ userId, type });
        const notifications =
          await this.notificationRepo.findNotificationByUserId(userId);
        const targetNotifications = notifications.filter(
          (n) => n.type === type && n.status === "unread"
        );

        logger.debug(
          `Found ${targetNotifications.length} unread ${type} notifications for user ${userId}`
        );

        for (const notification of targetNotifications) {
          const updated = await this.notificationRepo.markNotificationAsRead(
            notification._id.toString()
          );
          if (updated) {
            updatedNotifications.push(updated);
            logger.debug(`Marked notification ${notification._id} as read`);
          }
        }
        logger.info(
          `Marked ${updatedNotifications.length} ${type} notifications as read for user ${userId}`
        );
      }

      if (updatedNotifications.length === 0) {
        logger.warn(`No notifications found for ${notificationId || type}`);
      }
      return updatedNotifications;
    } catch (error: any) {
      logger.error(`Error marking notification(s) as read: ${error.message}`, {
        notificationId,
        userId,
        type,
        errorDetails: error,
      });
      throw new ServiceError(
        `Error marking notification(s) as read: ${error.message}`
      );
    }
  };

  getUnreadCount = async (
    userId: string,
    type?: IAppNotification["type"]
  ): Promise<number> => {
    try {
      logger.debug(
        `Fetching unread notification count for user: ${userId}${
          type ? `, type: ${type}` : ""
        }`
      );
      this.checkData(userId);
      return await this.notificationRepo.getNotificationUnreadCount(
        userId,
        type
      );
    } catch (error: any) {
      logger.error(
        `Error fetching unread notification count: ${error.message}`
      );
      throw new ServiceError(
        `Error fetching unread notification count: ${error.message}`
      );
    }
  };
}
