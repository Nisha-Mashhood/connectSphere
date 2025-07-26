import { Model, Types } from "mongoose";
import { BaseRepository } from "../../../core/Repositries/BaseRepositry";
import { RepositoryError } from "../../../core/Utils/ErrorHandler";
import logger from "../../../core/Utils/Logger";
import { AppNotificationModel } from "../../../models/notification.modal";
import { AppNotification as IAppNotification } from "../../../Interfaces/models/AppNotification";
import { ITask } from "../../../Interfaces/models/ITask";
import Collaboration from "../../../models/collaboration";
import Group from "../../../models/group.model";
import { IMentor } from "../../../Interfaces/models/IMentor";
import UserConnectionModal from "../../../models/userConnection.modal";
import { Task } from "../../../models/task.modal";
import { CollaborationData, UserIds } from "../Types/types";

export class NotificationRepository extends BaseRepository<IAppNotification> {
  constructor() {
    super(AppNotificationModel as Model<IAppNotification>);
  }

  private toObjectId(id: string | Types.ObjectId): Types.ObjectId {
    if (!id) {
      logger.error("Missing ID");
      throw new RepositoryError("Invalid ID: ID is required");
    }
    const idStr = typeof id === "string" ? id : id.toString();
    if (!Types.ObjectId.isValid(idStr)) {
      logger.error(`Invalid ID: ${idStr}`);
      throw new RepositoryError(
        "Invalid ID: must be a 24 character hex string"
      );
    }
    return new Types.ObjectId(idStr);
  }

  getTasksForNotification = async (taskId: string): Promise<ITask | null> => {
    try {
      logger.debug(`Fetching task for notification: ${taskId}`);
      const now = new Date();
      return await Task.findOne({
        _id: this.toObjectId(taskId),
        status: { $ne: "completed" },
        dueDate: { $gte: now },
        notificationDate: { $lte: now },
      }).exec();
    } catch (error: any) {
      logger.error(`Error fetching task for notification: ${error.message}`);
      throw new RepositoryError(
        `Error fetching task for notification: ${error.message}`
      );
    }
  };

  getAllTasksForNotification = async (): Promise<ITask[]> => {
    try {
      logger.debug("Fetching all tasks for notification");
      const now = new Date();
      return await Task.find({
        status: { $ne: "completed" },
        dueDate: { $gte: now },
        notificationDate: { $lte: now },
        notificationTime: { $exists: true },
      }).exec();
    } catch (error: any) {
      logger.error(
        `Error fetching all tasks for notification: ${error.message}`
      );
      throw new RepositoryError(
        `Error fetching all tasks for notification: ${error.message}`
      );
    }
  };

  getGroupMembers = async (groupId: string): Promise<Types.ObjectId[]> => {
    try {
      logger.debug(`Fetching group members for group: ${groupId}`);
      const group = await Group.findById(this.toObjectId(groupId))
        .select("members")
        .exec();
      return group
        ? group.members.map((member) => this.toObjectId(member.userId))
        : [];
    } catch (error: any) {
      logger.error(`Error fetching group members: ${error.message}`);
      throw new RepositoryError(
        `Error fetching group members: ${error.message}`
      );
    }
  };

  getMentorIdAndUserId = async (
    collaborationId: string
  ): Promise<UserIds | null> => {
    try {
      logger.debug(
        `Fetching mentor and user IDs for collaboration: ${collaborationId}`
      );
      const collaborationData = (await Collaboration.findById(
        this.toObjectId(collaborationId)
      )
        .populate<{ mentorId: IMentor }>({ path: "mentorId", select: "userId" })
        .select("userId mentorId")
        .exec()) as CollaborationData | null;

      if (!collaborationData) {
        logger.warn(`Collaboration not found: ${collaborationId}`);
        return null;
      }

      return {
        userId: collaborationData.userId.toString(),
        mentorUserId: collaborationData.mentorId?.userId?.toString() || null,
      };
    } catch (error: any) {
      logger.error(`Error fetching collaboration IDs: ${error.message}`);
      throw new RepositoryError(
        `Error fetching collaboration IDs: ${error.message}`
      );
    }
  };

  getConnectionUserIds = async (
    connectionId: string
  ): Promise<{ requester: string; recipient: string } | null> => {
    try {
      logger.debug(
        `Fetching connection user IDs for connection: ${connectionId}`
      );
      const connection = await UserConnectionModal.findById(
        this.toObjectId(connectionId)
      )
        .select("requester recipient")
        .exec();
      if (!connection) {
        logger.warn(`Connection not found: ${connectionId}`);
        return null;
      }
      return {
        requester: connection.requester.toString(),
        recipient: connection.recipient.toString(),
      };
    } catch (error: any) {
      logger.error(`Error fetching connection user IDs: ${error.message}`);
      throw new RepositoryError(
        `Error fetching connection user IDs: ${error.message}`
      );
    }
  };

  findTaskNotification = async (
    userId: string,
    taskId: string,
    notificationDate?: string,
    notificationTime?: string
  ): Promise<IAppNotification | null> => {
    try {
      logger.debug(
        `Finding task notification for user: ${userId}, task: ${taskId}`
      );
      return await this.model
        .findOne({
          userId: this.toObjectId(userId),
          type: "task_reminder",
          relatedId: taskId,
          notificationDate: notificationDate
            ? new Date(notificationDate)
            : undefined,
          notificationTime,
        })
        .exec();
    } catch (error: any) {
      logger.error(`Error finding task notification: ${error.message}`);
      throw new RepositoryError(
        `Error finding task notification: ${error.message}`
      );
    }
  };

  updateNotificationStatus = async (
    notificationId: string,
    status: "unread" | "read"
  ): Promise<IAppNotification | null> => {
    try {
      logger.debug(
        `Updating notification status: ${notificationId} to ${status}`
      );
      const notification = await this.model
        .findByIdAndUpdate(
          this.toObjectId(notificationId),
          { status, updatedAt: new Date() },
          { new: true }
        )
        .exec();
      if (!notification) {
        logger.warn(`Notification not found: ${notificationId}`);
      }
      return notification;
    } catch (error: any) {
      logger.error(`Error updating notification status: ${error.message}`);
      throw new RepositoryError(
        `Error updating notification status: ${error.message}`
      );
    }
  };

  updateTaskNotifications = async (
    relatedId: string,
    notificationDate?: Date,
    notificationTime?: string
  ): Promise<{ modifiedCount: number }> => {
    try {
      logger.debug(`Updating task notifications for task: ${relatedId}`);
      const updateData = {
        ...(notificationDate && {
          notificationDate: new Date(notificationDate),
        }),
        ...(notificationTime && { notificationTime }),
        updatedAt: new Date(),
      };
      const result = await this.model
        .updateMany({ relatedId, type: "task_reminder" }, { $set: updateData })
        .exec();
      return { modifiedCount: result.modifiedCount };
    } catch (error: any) {
      logger.error(`Error updating task notifications: ${error.message}`);
      throw new RepositoryError(
        `Error updating task notifications: ${error.message}`
      );
    }
  };

  createNotification = async (
    notification: Partial<IAppNotification>
  ): Promise<IAppNotification> => {
    try {
      logger.debug(`Creating notification for user: ${notification.userId}`);
      return await this.create({
        ...notification,
        userId: notification.userId
          ? this.toObjectId(notification.userId)
          : undefined,
        senderId: notification.senderId
          ? this.toObjectId(notification.senderId)
          : undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    } catch (error: any) {
      logger.error(`Error creating notification: ${error.message}`);
      throw new RepositoryError(
        `Error creating notification: ${error.message}`
      );
    }
  };

  findNotificationByUserId = async (
    userId: string
  ): Promise<IAppNotification[]> => {
    try {
      logger.debug(`Fetching notifications for user: ${userId}`);
      return await this.model
        .find({ userId: this.toObjectId(userId), status: "unread" })
        .sort({ createdAt: -1 })
        .limit(50)
        .exec();
    } catch (error: any) {
      logger.error(`Error fetching notifications by user ID: ${error.message}`);
      throw new RepositoryError(
        `Error fetching notifications by user ID: ${error.message}`
      );
    }
  };

  findNotificationByCallId = async (
    userId: string,
    callId: string
  ): Promise<IAppNotification | null> => {
    try {
      logger.debug(
        `Finding notification by call ID: ${callId} for user: ${userId}`
      );
      return await this.model
        .findOne({
          userId: this.toObjectId(userId),
          callId,
          type: "incoming_call",
          status: "unread",
        })
        .exec();
    } catch (error: any) {
      logger.error(`Error finding notification by call ID: ${error.message}`);
      throw new RepositoryError(
        `Error finding notification by call ID: ${error.message}`
      );
    }
  };

  updateNotificationToMissed = async (
    userId: string,
    callId: string,
    content: string
  ): Promise<IAppNotification | null> => {
    try {
      logger.debug(
        `Updating notification to missed call for user: ${userId}, call: ${callId}`
      );
      return await this.model
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
    } catch (error: any) {
      logger.error(`Error updating notification to missed: ${error.message}`);
      throw new RepositoryError(
        `Error updating notification to missed: ${error.message}`
      );
    }
  };

  markNotificationAsRead = async (
    notificationId: string
  ): Promise<IAppNotification | null> => {
    try {
      logger.debug(`Marking notification as read: ${notificationId}`);
      return await this.model
        .findByIdAndUpdate(
          this.toObjectId(notificationId),
          { status: "read", updatedAt: new Date() },
          { new: true }
        )
        .exec();
    } catch (error: any) {
      logger.error(`Error marking notification as read: ${error.message}`);
      throw new RepositoryError(
        `Error marking notification as read: ${error.message}`
      );
    }
  };

  //  getNotificationUnreadCount = async(userId: string): Promise<number> => {
  //   try {
  //     logger.debug(`Counting unread notifications for user: ${userId}`);
  //     return await this.model.countDocuments({ userId: this.toObjectId(userId), status: 'unread' }).exec();
  //   } catch (error: any) {
  //     logger.error(`Error counting unread notifications: ${error.message}`);
  //     throw new RepositoryError(`Error counting unread notifications: ${error.message}`);
  //   }
  // }

  async getNotificationUnreadCount(
    userId: string,
    type?: IAppNotification["type"]
  ): Promise<number> {
    try {
      logger.debug(
        `Fetching unread notification count for user: ${userId}${
          type ? `, type: ${type}` : ""
        }`
      );
      const query: any = { userId, status: "unread" };
      if (type) {
        query.type = type;
      }
      const count = await this.model.countDocuments(query);

      logger.info(`Count of notifications with type ${type} is : `, count);
      return count;
    } catch (error: any) {
      logger.error(
        `Error fetching unread notification count for user ${userId}: ${error.message}`
      );
      throw new RepositoryError(
        `Error fetching unread notification count: ${error.message}`
      );
    }
  }

  findNotificationByRelatedId = async (
    relatedId: string,
    options: { userId: string; type: string }
  ): Promise<IAppNotification | null> => {
    try {
      logger.debug(
        `Fetching notification by relatedId: ${relatedId} for user: ${options.userId}`
      );
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
    } catch (error: any) {
      logger.error(
        `Error fetching notification by relatedId ${relatedId}: ${error.message}`
      );
      throw new RepositoryError(
        `Error fetching notification by relatedId: ${error.message}`
      );
    }
  };

  updateNotificationById = async (
    notificationId: string,
    updateData: Partial<IAppNotification>
  ): Promise<IAppNotification | null> => {
    try {
      logger.debug(`Updating notification with ID: ${notificationId}`);
      const notification = await this.model
        .findByIdAndUpdate(
          this.toObjectId(notificationId),
          { $set: updateData },
          { new: true }
        )
        .exec();
      if (!notification) {
        logger.warn(`No notification found with ID: ${notificationId}`);
        return null;
      }
      logger.info(`Updated notification with ID: ${notificationId}`);
      return notification;
    } catch (error: any) {
      logger.error(
        `Error updating notification with ID ${notificationId}: ${error.message}`
      );
      throw new RepositoryError(
        `Error updating notification: ${error.message}`
      );
    }
  };
}
