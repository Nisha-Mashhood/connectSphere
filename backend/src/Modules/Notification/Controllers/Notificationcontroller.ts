import { Request, Response } from 'express';
import { NotificationService } from '../Service/NotificationService.js';
import logger from '../../../core/Utils/Logger.js';

export class NotificationController {
  private notificationService: NotificationService;

  constructor() {
    this.notificationService = new NotificationService();
  }

  async getNotifications(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.query.userId as string;
      logger.debug(`Fetching notifications for user: ${userId}`);
      if (!userId) {
        logger.error('Missing userId');
        throw new Error('userId is required');
      }
      const notifications = await this.notificationService.getNotifications(userId);
      res.status(200).json({
        success: true,
        message: 'Notifications fetched successfully',
        data: notifications,
      });
    } catch (error: any) {
      logger.error(`Error fetching notifications: ${error.message}`);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to fetch notifications',
      });
    }
  }

  async markAsRead(req: Request, res: Response): Promise<void> {
    try {
      const { notificationId } = req.params;
      logger.debug(`Marking notification as read: ${notificationId}`);
      const notification = await this.notificationService.markNotificationAsRead(notificationId);
      if (!notification) {
        logger.warn(`Notification not found: ${notificationId}`);
        res.status(404).json({
          success: false,
          message: 'Notification not found',
        });
        return;
      }
      res.status(200).json({
        success: true,
        message: 'Notification marked as read',
        data: notification,
      });
    } catch (error: any) {
      logger.error(`Error marking notification as read: ${error.message}`);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to mark notification as read',
      });
    }
  }

  async getUnreadCount(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.query.userId as string;
      logger.debug(`Fetching unread notification count for user: ${userId}`);
      if (!userId) {
        logger.error('Missing userId');
        throw new Error('userId is required');
      }
      const count = await this.notificationService.getUnreadCount(userId);
      res.status(200).json({
        success: true,
        message: 'Unread notification count fetched successfully',
        data: { count },
      });
    } catch (error: any) {
      logger.error(`Error fetching unread notification count: ${error.message}`);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to fetch unread notification count',
      });
    }
  }
}