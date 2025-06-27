import { Request, Response } from 'express';
import { NotificationService } from '../Service/NotificationService';
import logger from '../../../core/Utils/Logger';

export class NotificationController {
  private notificationService: NotificationService;

  constructor() {
    this.notificationService = new NotificationService();
  }

  getNotifications  = async(req: Request, res: Response): Promise<void> =>{
    try {
      const userId = req.query.userId as string;
      logger.debug(`Fetching notifications for user: ${userId}`);

      if (!userId) {
        logger.error('Missing userId');
        res.status(400).json({
          success: false,
          message: 'userId is required',
        });
        return;
      }

      // Return empty response for unauthenticated users or admins
      if (!req.currentUser || req.currentUser.role === 'admin') {
        logger.info(`No notifications for ${req.currentUser ? 'admin' : 'unauthenticated user'}, userId: ${userId}`);
        res.status(200).json({
          success: true,
          message: 'No notifications available',
          data: [],
        });
        return;
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

  markAsRead  = async(req: Request, res: Response): Promise<void> =>{
    try {
      const { notificationId } = req.params;
      logger.debug(`Marking notification as read: ${notificationId}`);

      if (!req.currentUser || req.currentUser.role === 'admin') {
        logger.info(`No action for ${req.currentUser ? 'admin' : 'unauthenticated user'} marking notification: ${notificationId}`);
        res.status(200).json({
          success: true,
          message: 'No action required',
          data: null,
        });
        return;
      }

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

  getUnreadCount  = async(req: Request, res: Response): Promise<void> =>{
    try {
      const userId = req.query.userId as string;
      logger.debug(`Fetching unread notification count for user: ${userId}`);
      
      
      if (!userId) {
        logger.error('Missing userId');
        res.status(400).json({
          success: false,
          message: 'userId is required',
        });
        return;
      }

      if (!req.currentUser || req.currentUser.role === 'admin') {
        logger.info(`No unread count for ${req.currentUser ? 'admin' : 'unauthenticated user'}, userId: ${userId}`);
        res.status(200).json({
          success: true,
          message: 'No unread notifications',
          data: { count: 0 },
        });
        return;
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