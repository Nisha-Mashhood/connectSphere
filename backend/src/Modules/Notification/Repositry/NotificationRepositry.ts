import { Model, Types } from 'mongoose';
import { BaseRepository } from '../../../core/Repositries/BaseRepositry.js';
import { RepositoryError } from '../../../core/Utils/ErrorHandler.js';
import logger from '../../../core/Utils/Logger.js';
import { AppNotificationModel } from '../../../models/notification.modal.js';
import { AppNotification as IAppNotification } from '../../../Interfaces/models/AppNotification.js';
import { ITask } from '../../../Interfaces/models/ITask.js';
import Collaboration from '../../../models/collaboration.js';
import Group from '../../../models/group.model.js';
import { IMentor } from '../../../Interfaces/models/IMentor.js';
import UserConnectionModal from '../../../models/userConnection.modal.js';
import { Task } from '../../../models/task.modal.js';

interface CollaborationData {
  userId: Types.ObjectId;
  mentorId: IMentor;
}

interface UserIds {
  userId: string;
  mentorUserId: string | null;
}

export class NotificationRepository extends BaseRepository<IAppNotification> {
  constructor() {
    super(AppNotificationModel as Model<IAppNotification>);
  }

  private toObjectId(id: string | Types.ObjectId): Types.ObjectId {
    if (!id) {
      logger.error('Missing ID');
      throw new RepositoryError('Invalid ID: ID is required');
    }
    const idStr = typeof id === 'string' ? id : id.toString();
    if (!Types.ObjectId.isValid(idStr)) {
      logger.error(`Invalid ID: ${idStr}`);
      throw new RepositoryError('Invalid ID: must be a 24 character hex string');
    }
    return new Types.ObjectId(idStr);
  }

  async getTasksForNotification(taskId: string): Promise<ITask | null> {
    try {
      logger.debug(`Fetching task for notification: ${taskId}`);
      const now = new Date();
      return await Task.findOne({
        _id: this.toObjectId(taskId),
        status: { $ne: 'completed' },
        dueDate: { $gte: now },
        notificationDate: { $lte: now },
      }).exec();
    } catch (error: any) {
      logger.error(`Error fetching task for notification: ${error.message}`);
      throw new RepositoryError(`Error fetching task for notification: ${error.message}`);
    }
  }

  async getAllTasksForNotification(): Promise<ITask[]> {
    try {
      logger.debug('Fetching all tasks for notification');
      const now = new Date();
      return await Task.find({
        status: { $ne: 'completed' },
        dueDate: { $gte: now },
        notificationDate: { $lte: now },
        notificationTime: { $exists: true },
      }).exec();
    } catch (error: any) {
      logger.error(`Error fetching all tasks for notification: ${error.message}`);
      throw new RepositoryError(`Error fetching all tasks for notification: ${error.message}`);
    }
  }

  async getGroupMembers(groupId: string): Promise<Types.ObjectId[]> {
    try {
      logger.debug(`Fetching group members for group: ${groupId}`);
      const group = await Group.findById(this.toObjectId(groupId)).select('members').exec();
      return group ? group.members.map(member => this.toObjectId(member.userId)) : [];
    } catch (error: any) {
      logger.error(`Error fetching group members: ${error.message}`);
      throw new RepositoryError(`Error fetching group members: ${error.message}`);
    }
  }

  async getMentorIdAndUserId(collaborationId: string): Promise<UserIds | null> {
    try {
      logger.debug(`Fetching mentor and user IDs for collaboration: ${collaborationId}`);
      const collaborationData = (await Collaboration.findById(this.toObjectId(collaborationId))
        .populate<{ mentorId: IMentor }>({ path: 'mentorId', select: 'userId' })
        .select('userId mentorId')
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
      throw new RepositoryError(`Error fetching collaboration IDs: ${error.message}`);
    }
  }

  async getConnectionUserIds(connectionId: string): Promise<{ requester: string; recipient: string } | null> {
    try {
      logger.debug(`Fetching connection user IDs for connection: ${connectionId}`);
      const connection = await UserConnectionModal.findById(this.toObjectId(connectionId))
        .select('requester recipient')
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
      throw new RepositoryError(`Error fetching connection user IDs: ${error.message}`);
    }
  }

  async findTaskNotification(
    userId: string,
    taskId: string,
    notificationDate?: string,
    notificationTime?: string
  ): Promise<IAppNotification | null> {
    try {
      logger.debug(`Finding task notification for user: ${userId}, task: ${taskId}`);
      return await this.model
        .findOne({
          userId: this.toObjectId(userId),
          type: 'task_reminder',
          relatedId: taskId,
          notificationDate: notificationDate ? new Date(notificationDate) : undefined,
          notificationTime,
        })
        .exec();
    } catch (error: any) {
      logger.error(`Error finding task notification: ${error.message}`);
      throw new RepositoryError(`Error finding task notification: ${error.message}`);
    }
  }

  async updateNotificationStatus(notificationId: string, status: 'unread' | 'read'): Promise<IAppNotification | null> {
    try {
      logger.debug(`Updating notification status: ${notificationId} to ${status}`);
      const notification = await this.model
        .findByIdAndUpdate(this.toObjectId(notificationId), { status, updatedAt: new Date() }, { new: true })
        .exec();
      if (!notification) {
        logger.warn(`Notification not found: ${notificationId}`);
      }
      return notification;
    } catch (error: any) {
      logger.error(`Error updating notification status: ${error.message}`);
      throw new RepositoryError(`Error updating notification status: ${error.message}`);
    }
  }

  async updateTaskNotifications(
    relatedId: string,
    notificationDate?: Date,
    notificationTime?: string
  ): Promise<{ modifiedCount: number }> {
    try {
      logger.debug(`Updating task notifications for task: ${relatedId}`);
      const updateData = {
        ...(notificationDate && { notificationDate: new Date(notificationDate) }),
        ...(notificationTime && { notificationTime }),
        updatedAt: new Date(),
      };
      const result = await this.model.updateMany(
        { relatedId, type: 'task_reminder' },
        { $set: updateData }
      ).exec();
      return { modifiedCount: result.modifiedCount };
    } catch (error: any) {
      logger.error(`Error updating task notifications: ${error.message}`);
      throw new RepositoryError(`Error updating task notifications: ${error.message}`);
    }
  }

  async createNotification(notification: Partial<IAppNotification>): Promise<IAppNotification> {
    try {
      logger.debug(`Creating notification for user: ${notification.userId}`);
      return await this.create({
        ...notification,
        userId: notification.userId ? this.toObjectId(notification.userId) : undefined,
        senderId: notification.senderId ? this.toObjectId(notification.senderId) : undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    } catch (error: any) {
      logger.error(`Error creating notification: ${error.message}`);
      throw new RepositoryError(`Error creating notification: ${error.message}`);
    }
  }

  async findNotificationByUserId(userId: string): Promise<IAppNotification[]> {
    try {
      logger.debug(`Fetching notifications for user: ${userId}`);
      return await this.model
        .find({ userId: this.toObjectId(userId), status: 'unread' })
        .sort({ createdAt: -1 })
        .limit(50)
        .exec();
    } catch (error: any) {
      logger.error(`Error fetching notifications by user ID: ${error.message}`);
      throw new RepositoryError(`Error fetching notifications by user ID: ${error.message}`);
    }
  }

  async findNotificationByCallId(userId: string, callId: string): Promise<IAppNotification | null> {
    try {
      logger.debug(`Finding notification by call ID: ${callId} for user: ${userId}`);
      return await this.model
        .findOne({ userId: this.toObjectId(userId), callId, type: 'incoming_call', status: 'unread' })
        .exec();
    } catch (error: any) {
      logger.error(`Error finding notification by call ID: ${error.message}`);
      throw new RepositoryError(`Error finding notification by call ID: ${error.message}`);
    }
  }

  async updateNotificationToMissed(
    userId: string,
    callId: string,
    content: string
  ): Promise<IAppNotification | null> {
    try {
      logger.debug(`Updating notification to missed call for user: ${userId}, call: ${callId}`);
      return await this.model
        .findOneAndUpdate(
          { userId: this.toObjectId(userId), callId, type: 'incoming_call', status: 'unread' },
          { type: 'missed_call', content, updatedAt: new Date() },
          { new: true }
        )
        .exec();
    } catch (error: any) {
      logger.error(`Error updating notification to missed: ${error.message}`);
      throw new RepositoryError(`Error updating notification to missed: ${error.message}`);
    }
  }

  async markNotificationAsRead(notificationId: string): Promise<IAppNotification | null> {
    try {
      logger.debug(`Marking notification as read: ${notificationId}`);
      return await this.model
        .findByIdAndUpdate(this.toObjectId(notificationId), { status: 'read', updatedAt: new Date() }, { new: true })
        .exec();
    } catch (error: any) {
      logger.error(`Error marking notification as read: ${error.message}`);
      throw new RepositoryError(`Error marking notification as read: ${error.message}`);
    }
  }

  async getNotificationUnreadCount(userId: string): Promise<number> {
    try {
      logger.debug(`Counting unread notifications for user: ${userId}`);
      return await this.model.countDocuments({ userId: this.toObjectId(userId), status: 'unread' }).exec();
    } catch (error: any) {
      logger.error(`Error counting unread notifications: ${error.message}`);
      throw new RepositoryError(`Error counting unread notifications: ${error.message}`);
    }
  }
}