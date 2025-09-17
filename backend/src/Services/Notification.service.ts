import { inject, injectable } from "inversify";
import { Types } from "mongoose";
import { ServiceError } from "../Core/Utils/ErrorHandler";
import logger from "../Core/Utils/Logger";
import { IAppNotification } from "../Interfaces/Models/IAppNotification";
import { ITask } from "../Interfaces/Models/ITask";
import { Server } from "socket.io";
import { SocketService } from "../socket/SocketService";
import { convertTo24HourFormat } from "../Utils/Utils/Notification.utils/Helper";
import { INotificationService } from "../Interfaces/Services/INotificationService";
import { TaskNotificationPayload } from "../Utils/Types/Notification.types";
import { StatusCodes } from "../Enums/StatusCode.enums";
import { INotificationRepository } from "../Interfaces/Repository/INotificationRepository";
import { IUserRepository } from "../Interfaces/Repository/IUserRepository";

let io: Server | null = null;

@injectable()
export class NotificationService  implements INotificationService{
  private _notificationRepository: INotificationRepository;
  private _userRepository: IUserRepository;
  private intervalId: NodeJS.Timeout | null = null;

  constructor(
    @inject('INotificationRepository') notificationRepository : INotificationRepository,
    @inject('IUserRepository') userRepository : IUserRepository,
  ) {
    this._notificationRepository = notificationRepository;
    this._userRepository = userRepository;
  }

  initializeSocket(_io: Server) {
    io = _io;
    logger.info("Notification service initialized with Socket.IO");
    this.startNotificationInterval();
  }

  private startNotificationInterval() {
    if (this.intervalId) {
      clearInterval(this.intervalId); 
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
        await this._notificationRepository.getTasksForNotification(taskId);
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
          await this._notificationRepository.getMentorIdAndUserId(
            task.contextId.toString()
          );
        if (collaborationIds) {
          recipients = [
            collaborationIds.userId,
            collaborationIds.mentorUserId,
          ].filter((id): id is string => id !== null);
        }
      } else if (task.contextType === "group") {
        const groupMembers = await this._notificationRepository.getGroupMembers(
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

      const assigner = await this._userRepository.findById(task.createdBy.toString());
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

        let notification = await this._notificationRepository.findTaskNotification(
          userId,
          task._id.toString(),
          notificationDate,
          notificationTime
        );

        if (notification && notification.status === "read") {
          notification = await this._notificationRepository.updateNotificationStatus(
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

          notification = await this._notificationRepository.createNotification(
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
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error sending task notification for task ${taskId}: ${err.message}`);
      throw error instanceof ServiceError
        ? error
        : new ServiceError(
            "Failed to send task notification",
            StatusCodes.INTERNAL_SERVER_ERROR,
            err
          )
    }
  };

  checkAndSendNotifications = async (): Promise<TaskNotificationPayload[]> => {
    try {
      logger.debug("Checking and sending notifications");
      const allNotifications: TaskNotificationPayload[] = [];
      const tasks: ITask[] =
        await this._notificationRepository.getAllTasksForNotification();
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
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error checking and sending notifications: ${err.message}`);
      throw error instanceof ServiceError
        ? error
        : new ServiceError(
            "Failed to check and send notifications",
            StatusCodes.INTERNAL_SERVER_ERROR,
            err
          )
    }
  };

  sendNotification = async (
    userId: string,
    notificationType: IAppNotification["type"],
    senderId: string,
    relatedId: string,
    contentType?: string,
    callId?: string,
    callType?: IAppNotification["callType"],
    customContent?: string
  ): Promise<IAppNotification> => {
    try {
      logger.debug(
        `Sending notification to user: ${userId}, type: ${notificationType}`
      );
      if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(senderId) || !Types.ObjectId.isValid(relatedId)) {
        logger.error("Invalid user ID, sender ID, or related ID");
        throw new ServiceError(
          "User ID, sender ID, and related ID must be valid ObjectIds",
          StatusCodes.BAD_REQUEST
        );
      }

      const validTypes: IAppNotification["type"][] = [
        "message",
        "incoming_call",
        "missed_call",
        "task_reminder",
        "new_user",
        "new_mentor",
        "mentor_approved",
        "collaboration_status",
      ];
      if (!validTypes.includes(notificationType)) {
        logger.error(`Invalid notification type: ${notificationType}`);
        throw new ServiceError(
          `Notification type must be one of: ${validTypes.join(", ")}`,
          StatusCodes.BAD_REQUEST
        );
      }

      if (contentType) {
        const validContextTypes = ["profile", "group", "collaboration", "userconnection"];
        if (!validContextTypes.includes(contentType)) {
          logger.error(`Invalid content type: ${contentType}`);
          throw new ServiceError(
            `Content type must be one of: ${validContextTypes.join(", ")}`,
            StatusCodes.BAD_REQUEST
          );
        }
      }

      if (callType) {
        const validCallTypes: IAppNotification["callType"][] = ["audio", "video"];
        if (!validCallTypes.includes(callType)) {
          logger.error(`Invalid call type: ${callType}`);
          throw new ServiceError(
            `Call type must be one of: ${validCallTypes.join(", ")}`,
            StatusCodes.BAD_REQUEST
          );
        }
      }

      const sender = await this._userRepository.findById(senderId);
      if (!sender) {
        logger.warn(`Sender not found: ${senderId}`);
        throw new ServiceError("Sender not found", StatusCodes.NOT_FOUND);
      }
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
        const task = await this._notificationRepository.getTasksForNotification(
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
        callType,
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

      const notification = await this._notificationRepository.createNotification(
        notificationData
      );
      if (!notification) {
        logger.error(`Failed to create notification for user ${userId}`);
        throw new ServiceError(
          "Failed to create notification",
          StatusCodes.INTERNAL_SERVER_ERROR
        );
      }

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
            callType: notification.callType,
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
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error sending notification to user ${userId}: ${err.message}`);
      throw error instanceof ServiceError
        ? error
        : new ServiceError(
            "Failed to send notification",
            StatusCodes.INTERNAL_SERVER_ERROR,
            err
          );
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
      if (!Types.ObjectId.isValid(userId)) {
        logger.error("Invalid user ID or call ID");
        throw new ServiceError(
          "User ID and call ID must be valid ObjectIds",
          StatusCodes.BAD_REQUEST
        );
      }

      if (!content || content.trim() === "") {
        logger.error("Content is required for missed call notification");
        throw new ServiceError(
          "Content is required for missed call notification",
          StatusCodes.BAD_REQUEST
        );
      }

      const notification =
        await this._notificationRepository.updateNotificationToMissed(
          userId,
          callId,
          content
        );

        if (!notification) {
        logger.warn(`No notification found for user ${userId} and call ${callId}`);
        throw new ServiceError(
          "Notification not found",
          StatusCodes.NOT_FOUND
        );
      }

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
        try {
          SocketService.notificationEmitter.emit("notification.updated", payload);
        } catch (socketError: any) {
          logger.error(`Socket emission error: ${socketError.message}`);
        }
      }
      return notification;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error updating call notification to missed for user ${userId}: ${err.message}`);
      throw error instanceof ServiceError
        ? error
        : new ServiceError(
            "Failed to update call notification to missed",
            StatusCodes.INTERNAL_SERVER_ERROR,
            err
          );
    }
  };

  getNotifications = async (userId: string): Promise<IAppNotification[]> => {
    try {
      logger.debug(`Fetching notifications for user: ${userId}`);
      return await this._notificationRepository.findNotificationByUserId(userId);
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error fetching notifications for user ${userId}: ${err.message}`);
      throw error instanceof ServiceError
        ? error
        : new ServiceError(
            "Failed to fetch notifications",
            StatusCodes.INTERNAL_SERVER_ERROR,
            err
          );
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
        logger.error("Either notificationId or type must be provided");
        throw new ServiceError(
          "Either notificationId or type must be provided",
          StatusCodes.BAD_REQUEST
        );
      }

      if (type && !userId) {
        logger.error("userId is required when marking notifications by type");
        throw new ServiceError(
          "userId is required when marking notifications by type",
          StatusCodes.BAD_REQUEST
        );
      }

      if (notificationId && !Types.ObjectId.isValid(notificationId)) {
        logger.error("Invalid notification ID");
        throw new ServiceError(
          "Notification ID must be a valid ObjectId",
          StatusCodes.BAD_REQUEST
        );
      }

      if (userId && !Types.ObjectId.isValid(userId)) {
        logger.error("Invalid user ID");
        throw new ServiceError(
          "User ID must be a valid ObjectId",
          StatusCodes.BAD_REQUEST
        );
      }

      if (type) {
        const validTypes: IAppNotification["type"][] = [
          "message",
          "incoming_call",
          "missed_call",
          "task_reminder",
          "new_user",
          "new_mentor",
          "mentor_approved",
          "collaboration_status",
        ];
        if (!validTypes.includes(type)) {
          logger.error(`Invalid notification type: ${type}`);
          throw new ServiceError(
            `Notification type must be one of: ${validTypes.join(", ")}`,
            StatusCodes.BAD_REQUEST
          );
        }
      }

      const updatedNotifications: IAppNotification[] = [];

      if (notificationId) {
        const notification = await this._notificationRepository.markNotificationAsRead(notificationId);
        if (notification) {
          updatedNotifications.push(notification);
          logger.info(`Marked notification ${notificationId} as read`);
        } else {
          logger.warn(`Notification not found: ${notificationId}`);
          throw new ServiceError(
            "Notification not found",
            StatusCodes.NOT_FOUND
          );
        }
      } else if (userId && type) {
        const notifications = await this._notificationRepository.findNotificationByUserId(userId);
        const targetNotifications = notifications.filter(
          (n) => n.type === type && n.status === "unread"
        );

        logger.debug(`Found ${targetNotifications.length} unread ${type} notifications for user ${userId}`);

        for (const notification of targetNotifications) {
          const updated = await this._notificationRepository.markNotificationAsRead(notification._id.toString());
          if (updated) {
            updatedNotifications.push(updated);
            logger.debug(`Marked notification ${notification._id} as read`);
          }
        }
        logger.info(`Marked ${updatedNotifications.length} ${type} notifications as read for user ${userId}`);
      }

      if (updatedNotifications.length === 0) {
        logger.warn(`No notifications found for ${notificationId || type}`);
        throw new ServiceError(
          "No notifications found to mark as read",
          StatusCodes.NOT_FOUND
        )
      }
      return updatedNotifications;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error marking notification(s) as read: ${err.message}`, {
        notificationId,
        userId,
        type,
        errorDetails: err,
      })
      throw error instanceof ServiceError
        ? error
        : new ServiceError(
            "Failed to mark notification(s) as read",
            StatusCodes.INTERNAL_SERVER_ERROR,
            err
          )
    }
  };

  getUnreadCount = async (
    userId: string,
    type?: IAppNotification["type"]
  ): Promise<number> => {
    try {
      logger.debug(`Fetching unread notification count for user: ${userId}${type ? `, type: ${type}` : ""}`);

      if (!Types.ObjectId.isValid(userId)) {
        logger.error("Invalid user ID");
        throw new ServiceError(
          "User ID must be a valid ObjectId",
          StatusCodes.BAD_REQUEST
        );
      }

      if (type) {
        const validTypes: IAppNotification["type"][] = [
          "message",
          "incoming_call",
          "missed_call",
          "task_reminder",
          "new_user",
          "new_mentor",
          "mentor_approved",
          "collaboration_status",
        ];
        if (!validTypes.includes(type)) {
          logger.error(`Invalid notification type: ${type}`);
          throw new ServiceError(
            `Notification type must be one of: ${validTypes.join(", ")}`,
            StatusCodes.BAD_REQUEST
          );
        }
      }

      const count = await this._notificationRepository.getNotificationUnreadCount(userId, type);
      logger.info(`Fetched unread count ${count} for user ${userId}${type ? `, type: ${type}` : ""}`);
      return count;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error fetching unread notification count for user ${userId}: ${err.message}`);
      throw error instanceof ServiceError
        ? error
        : new ServiceError(
            "Failed to fetch unread notification count",
            StatusCodes.INTERNAL_SERVER_ERROR,
            err
          );
    }
  }
}
