import { injectable } from "inversify";
import { Model, Types } from "mongoose";
import { BaseRepository } from "../core/repositries/base-repositry";
import { RepositoryError } from "../core/utils/error-handler";
import logger from "../core/utils/logger";
import { AppNotificationModel } from "../Models/notification-model";
import { IAppNotification } from "../Interfaces/Models/i-app-notification";
import { ITask } from "../Interfaces/Models/i-task";
import { Task } from "../Models/task-model";
import { StatusCodes } from "../enums/status-code-enums";
import { INotificationRepository } from "../Interfaces/Repository/i-notification-repositry";

@injectable()
export class NotificationRepository extends BaseRepository<IAppNotification> implements INotificationRepository {
  constructor() {
    super(AppNotificationModel as Model<IAppNotification>);
  }

  private toObjectId = (id?: string | Types.ObjectId): Types.ObjectId => {
    if (!id) {
      logger.warn('Missing ID when converting to ObjectId');
      throw new RepositoryError('Invalid ID: ID is required', StatusCodes.BAD_REQUEST);
    }
    const idStr = typeof id === 'string' ? id : id.toString();
    if (!Types.ObjectId.isValid(idStr)) {
      logger.warn(`Invalid ObjectId format: ${idStr}`);
      throw new RepositoryError('Invalid ID: must be a 24 character hex string', StatusCodes.BAD_REQUEST);
    }
    return new Types.ObjectId(idStr);
  }

  public getTasksForNotification = async (taskId: string): Promise<ITask | null> => {
    try {
      logger.debug(`Fetching task for notification: ${taskId}`);
      const task = await Task.findOne({
        _id: this.toObjectId(taskId),
        status: { $ne: "completed" },
        dueDate: { $gte: new Date() },
        notificationDate: { $lte: new Date() },
      }).exec();
      logger.info(`Task ${task ? 'found' : 'not found'} for notification: ${taskId}`);
      return task;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error fetching task for notification ${taskId}`, err);
      throw new RepositoryError('Error fetching task for notification', StatusCodes.INTERNAL_SERVER_ERROR, err);
    }
  }

  public getAllTasksForNotification = async (): Promise<ITask[]> => {
    try {
      logger.debug("Fetching all tasks for notification");
      const tasks = await Task.find({
        status: { $ne: "completed" },
        dueDate: { $gte: new Date() },
        notificationDate: { $lte: new Date() },
        notificationTime: { $exists: true },
      }).exec();
      logger.info(`Fetched ${tasks.length} tasks for notification`);
      return tasks;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error fetching all tasks for notification`, err);
      throw new RepositoryError('Error fetching all tasks for notification', StatusCodes.INTERNAL_SERVER_ERROR, err);
    }
  }

  public findTaskNotification = async (
    userId: string,
    taskId: string,
    notificationDate?: string,
    notificationTime?: string
  ): Promise<IAppNotification | null> => {
    try {
      logger.debug(`Finding task notification for user: ${userId}, task: ${taskId}`);
      const notification = await this.model
        .findOne({
          userId: this.toObjectId(userId),
          type: "task_reminder",
          relatedId: taskId,
          notificationDate: notificationDate ? new Date(notificationDate) : undefined,
          notificationTime,
        })
        .exec();
      logger.info(`Task notification ${notification ? 'found' : 'not found'} for user: ${userId}, task: ${taskId}`);
      return notification;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error finding task notification for user ${userId}, task ${taskId}`, err);
      throw new RepositoryError('Error finding task notification', StatusCodes.INTERNAL_SERVER_ERROR, err);
    }
  }

  public updateNotificationStatus = async (
    notificationId: string,
    status: "unread" | "read"
  ): Promise<IAppNotification | null> => {
    try {
      logger.debug(`Updating notification status: ${notificationId} to ${status}`);
      const notification = await this.model
        .findByIdAndUpdate(
          this.toObjectId(notificationId),
          { status, updatedAt: new Date() },
          { new: true }
        )
        .exec();
      if (!notification) {
        logger.warn(`Notification not found: ${notificationId}`);
        throw new RepositoryError(`Notification not found with ID: ${notificationId}`, StatusCodes.NOT_FOUND);
      }
      logger.info(`Notification status updated: ${notificationId} to ${status}`);
      return notification;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error updating notification status for ID ${notificationId}`, err);
      throw new RepositoryError('Error updating notification status', StatusCodes.INTERNAL_SERVER_ERROR, err);
    }
  }

  public updateTaskNotifications = async (
    relatedId: string,
    notificationDate?: Date,
    notificationTime?: string
  ): Promise<{ modifiedCount: number }> => {
    try {
      logger.debug(`Updating task notifications for task: ${relatedId}`);
      const updateData = {
        ...(notificationDate && { notificationDate: new Date(notificationDate) }),
        ...(notificationTime && { notificationTime }),
        updatedAt: new Date(),
      };
      const result = await this.model
        .updateMany({ relatedId, type: "task_reminder" }, { $set: updateData })
        .exec();
      logger.info(`Updated ${result.modifiedCount} task notifications for task: ${relatedId}`);
      return { modifiedCount: result.modifiedCount };
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error updating task notifications for task ${relatedId}`, err);
      throw new RepositoryError('Error updating task notifications', StatusCodes.INTERNAL_SERVER_ERROR, err);
    }
  }

  public createNotification = async (notification: Partial<IAppNotification>): Promise<IAppNotification> => {
    try {
      logger.debug(`Creating notification for user: ${notification.userId}`);
      const newNotification = await this.create({
        ...notification,
        userId: notification.userId ? this.toObjectId(notification.userId) : undefined,
        senderId: notification.senderId ? this.toObjectId(notification.senderId) : undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      logger.info(`Notification created: ${newNotification._id}`);
      return newNotification;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error creating notification for user ${notification.userId}`, err);
      throw new RepositoryError('Error creating notification', StatusCodes.INTERNAL_SERVER_ERROR, err);
    }
  }

  public findNotificationByUserId = async (userId: string): Promise<IAppNotification[]> => {
    try {
      logger.debug(`Fetching notifications for user: ${userId}`);
      const notifications = await this.model
        .find({ userId: this.toObjectId(userId) })
        .sort({ createdAt: -1 })
        .limit(50)
        .exec();
      logger.info(`Fetched ${notifications.length} notifications for user: ${userId}`);
      return notifications;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error fetching notifications for user ${userId}`, err);
      throw new RepositoryError('Error fetching notifications by user ID', StatusCodes.INTERNAL_SERVER_ERROR, err);
    }
  }

  public findNotificationByCallId = async (userId: string, callId: string): Promise<IAppNotification | null> => {
    try {
      logger.debug(`Finding notification by call ID: ${callId} for user: ${userId}`);
      const notification = await this.model
        .findOne({
          userId: this.toObjectId(userId),
          callId,
          type: "incoming_call",
          status: "unread",
        })
        .exec();
      logger.info(`Notification ${notification ? 'found' : 'not found'} for callId: ${callId}, user: ${userId}`);
      return notification;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error finding notification by call ID ${callId} for user ${userId}`, err);
      throw new RepositoryError('Error finding notification by call ID', StatusCodes.INTERNAL_SERVER_ERROR, err);
    }
  }

  public updateNotificationToMissed = async (
    userId: string,
    callId: string,
    content: string
  ): Promise<IAppNotification | null> => {
    try {
      logger.debug(`Updating notification to missed call for user: ${userId}, call: ${callId}`);
      const notification = await this.model
        .findOneAndUpdate(
          {
            userId: this.toObjectId(userId),
            callId,
            type: "incoming_call",
            status: "unread",
          },
          { type: "missed_call", content, updatedAt: new Date() },
          { new: true }
        )
        .exec();
      if (!notification) {
        logger.warn(`Notification not found for callId: ${callId}, user: ${userId}`);
        throw new RepositoryError(`Notification not found for callId: ${callId}`, StatusCodes.NOT_FOUND);
      }
      logger.info(`Notification updated to missed call: ${notification._id}`);
      return notification;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error updating notification to missed for callId ${callId}, user ${userId}`, err);
      throw new RepositoryError('Error updating notification to missed', StatusCodes.INTERNAL_SERVER_ERROR, err);
    }
  }

  public markNotificationAsRead = async (notificationId: string): Promise<IAppNotification | null> => {
    try {
      logger.debug(`Marking notification as read: ${notificationId}`);
      const notification = await this.model
        .findByIdAndUpdate(
          this.toObjectId(notificationId),
          { status: "read", updatedAt: new Date() },
          { new: true }
        )
        .exec();
      if (!notification) {
        logger.warn(`Notification not found: ${notificationId}`);
        throw new RepositoryError(`Notification not found with ID: ${notificationId}`, StatusCodes.NOT_FOUND);
      }
      logger.info(`Notification marked as read: ${notificationId}`);
      return notification;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error marking notification as read for ID ${notificationId}`, err);
      throw new RepositoryError('Error marking notification as read', StatusCodes.INTERNAL_SERVER_ERROR, err);
    }
  }

  public getNotificationUnreadCount = async (
    userId: string,
    type?: IAppNotification["type"]
  ): Promise<number> => {
    try {
      logger.debug(`Fetching unread notification count for user: ${userId}${type ? `, type: ${type}` : ""}`);
      const query: Record<string, any> = { userId: this.toObjectId(userId), status: "unread" };
      if (type) {
        query.type = type;
      }
      const count = await this.model.countDocuments(query).exec();
      logger.info(`Fetched unread notification count: ${count} for user: ${userId}${type ? `, type: ${type}` : ""}`);
      return count;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error fetching unread notification count for user ${userId}`, err);
      throw new RepositoryError('Error fetching unread notification count', StatusCodes.INTERNAL_SERVER_ERROR, err);
    }
  }

  public findNotificationByRelatedId = async (
    relatedId: string,
    options: { userId: string; type: string }
  ): Promise<IAppNotification | null> => {
    try {
      logger.debug(`Fetching notification by relatedId: ${relatedId} for user: ${options.userId}`);
      const notification = await this.model
        .findOne({
          relatedId,
          userId: this.toObjectId(options.userId),
          type: options.type,
        })
        .exec();
      logger.info(
        notification
          ? `Found notification with ID: ${notification._id} for relatedId: ${relatedId}`
          : `No notification found for relatedId: ${relatedId}`
      );
      return notification;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error fetching notification by relatedId ${relatedId} for user ${options.userId}`, err);
      throw new RepositoryError('Error fetching notification by relatedId', StatusCodes.INTERNAL_SERVER_ERROR, err);
    }
  }

  public updateNotificationById = async (
    notificationId: string,
    updateData: Partial<IAppNotification>
  ): Promise<IAppNotification | null> => {
    try {
      logger.debug(`Updating notification with ID: ${notificationId}`);
      const notification = await this.model
        .findByIdAndUpdate(this.toObjectId(notificationId), { $set: updateData }, { new: true })
        .exec();
      if (!notification) {
        logger.warn(`Notification not found: ${notificationId}`);
        throw new RepositoryError(`Notification not found with ID: ${notificationId}`, StatusCodes.NOT_FOUND);
      }
      logger.info(`Updated notification: ${notificationId}`);
      return notification;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error updating notification with ID ${notificationId}`, err);
      throw new RepositoryError('Error updating notification', StatusCodes.INTERNAL_SERVER_ERROR, err);
    }
  }

}
