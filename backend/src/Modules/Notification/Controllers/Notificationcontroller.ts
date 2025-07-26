import { Request, Response } from "express";
import { NotificationService } from "../Service/NotificationService";
import logger from "../../../core/Utils/Logger";
import { AppNotification } from "../../../Interfaces/models/AppNotification";

export class NotificationController {
  private notificationService: NotificationService;

  constructor() {
    this.notificationService = new NotificationService();
  }

  getNotifications = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.query.userId as string;
      logger.debug(`Fetching notifications for user: ${userId}`);

      if (!userId) {
        logger.error("Missing userId");
        res.status(400).json({
          success: false,
          message: "userId is required",
        });
        return;
      }

      // Return empty response for unauthenticated users or admins
      if (!req.currentUser || req.currentUser.role === "admin") {
        logger.info(
          `No notifications for ${
            req.currentUser ? "admin" : "unauthenticated user"
          }, userId: ${userId}`
        );
        res.status(200).json({
          success: true,
          message: "No notifications available",
          data: [],
        });
        return;
      }

      const notifications = await this.notificationService.getNotifications(
        userId
      );
      res.status(200).json({
        success: true,
        message: "Notifications fetched successfully",
        data: notifications,
      });
    } catch (error: any) {
      logger.error(`Error fetching notifications: ${error.message}`);
      res.status(400).json({
        success: false,
        message: error.message || "Failed to fetch notifications",
      });
    }
  };

  markAsRead = async (req: Request, res: Response): Promise<void> => {
    try {
      const notificationId = req.query.notificationId as string | undefined;
      const userId = req.query.userId as string | undefined;
      const type = req.query.type as AppNotification["type"] | undefined;

      logger.info(
        `Notification Id ${notificationId} userId ${userId} type ${type}`
      );

      if (type && (!req.currentUser || req.currentUser.role !== "admin")) {
        logger.info(
          `No action for ${
            req.currentUser ? "non-admin" : "unauthenticated user"
          } marking notifications by type: ${type}`
        );
        res.status(403).json({
          success: false,
          message: "Only admins can mark notifications by type",
        });
        return;
      }

      if (type && !userId) {
        logger.error("userId is required when marking notifications by type");
        res.status(400).json({
          success: false,
          message: "userId is required when marking notifications by type",
        });
        return;
      }

      const result = await this.notificationService.markNotificationAsRead(
        notificationId,
        userId,
        type
      );

      res.status(200).json({
        success: true,
        message: notificationId
          ? "Notification marked as read"
          : `All ${type} notifications marked as read`,
        data: result || [],
      });
    } catch (error: any) {
      logger.error(`Error marking notification(s) as read: ${error.message}`);
      res.status(400).json({
        success: false,
        message: error.message || "Failed to mark notification(s) as read",
      });
    }
  };

  getUnreadCount = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.query.userId as string;
      const type = req.query.type as AppNotification["type"];
      logger.debug(
        `Fetching unread notification count for user: ${userId}${
          type ? `, type: ${type}` : ""
        }`
      );

      if (!userId) {
        logger.error("Missing userId");
        res.status(400).json({
          success: false,
          message: "userId is required",
        });
        return;
      }

      // Allow admins to fetch notification counts
      if (!req.currentUser) {
        logger.info(
          `No unread count for unauthenticated user, userId: ${userId}`
        );
        res.status(200).json({
          success: true,
          message: "No unread notifications",
          data: { count: 0 },
        });
        return;
      }

      const count = await this.notificationService.getUnreadCount(userId, type);
      res.status(200).json({
        success: true,
        message: "Unread notification count fetched successfully",
        data: { count },
      });
    } catch (error: any) {
      logger.error(
        `Error fetching unread notification count: ${error.message}`
      );
      res.status(400).json({
        success: false,
        message: error.message || "Failed to fetch unread notification count",
      });
    }
  };
}
