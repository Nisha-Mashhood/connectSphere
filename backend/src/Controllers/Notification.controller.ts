import { NextFunction, Request, Response } from "express";
import { inject } from "inversify";
import logger from "../Core/Utils/Logger";
import { IAppNotification } from "../Interfaces/Models/IAppNotification";
import { INotificationController } from "../Interfaces/Controller/INotificationController";
import { StatusCodes } from "../Constants/StatusCode.constants";
import { BaseController } from "../Core/Controller/BaseController";
import { HttpError } from "../Core/Utils/ErrorHandler";
import { INotificationService } from "../Interfaces/Services/INotificationService";

export class NotificationController extends BaseController implements INotificationController{
  private _notificationService: INotificationService;

  constructor(@inject('INotificationService') notificationService : INotificationService) {
    super();
    this._notificationService = notificationService;
  }

  getNotifications = async (req: Request, res: Response, next:NextFunction): Promise<void> => {
    try {
      const userId = req.query.userId as string;
      logger.debug(`Fetching notifications for user: ${userId}`);

      if (!userId) {
        logger.error("Missing userId");
        throw new HttpError("userId is required", StatusCodes.BAD_REQUEST)
      }

      // Return empty response for unauthenticated users or admins
      if (!req.currentUser || req.currentUser.role === "admin") {
        logger.info(
          `No notifications for ${
            req.currentUser ? "admin" : "unauthenticated user"
          }, userId: ${userId}`
        );
        this.sendSuccess(res, [], "No notifications available");
        return;
      }

      const notifications = await this._notificationService.getNotifications(
        userId
      );
      this.sendSuccess(res, notifications, "Notifications fetched successfully");
    } catch (error: any) {
      logger.error(`Error fetching notifications: ${error.message}`);
      next(error)
    }
  };

  markAsRead = async (req: Request, res: Response, next:NextFunction): Promise<void> => {
    try {
      const notificationId = req.query.notificationId as string | undefined;
      const userId = req.query.userId as string | undefined;
      const type = req.query.type as IAppNotification["type"] | undefined;

      logger.info(
        `Notification Id ${notificationId} userId ${userId} type ${type}`
      );

      if (type && (!req.currentUser || req.currentUser.role !== "admin")) {
        logger.info(
          `No action for ${
            req.currentUser ? "non-admin" : "unauthenticated user"
          } marking notifications by type: ${type}`
        );
        throw new HttpError("Only admins can mark notifications by type", StatusCodes.FORBIDDEN);
      }

      if (type && !userId) {
        logger.error("userId is required when marking notifications by type");
        throw new HttpError("userId is required when marking notifications by type", StatusCodes.BAD_REQUEST);
      }

      const result = await this._notificationService.markNotificationAsRead(
        notificationId,
        userId,
        type
      );

      this.sendSuccess(
      res,
      result || [],
      notificationId
        ? "Notification marked as read"
        : `All ${type} notifications marked as read`
    );
    } catch (error: any) {
      logger.error(`Error marking notification(s) as read: ${error.message}`);
      next(error)
    }
  };

  getUnreadCount = async (req: Request, res: Response, next:NextFunction): Promise<void> => {
    try {
      const userId = req.query.userId as string;
      const type = req.query.type as IAppNotification["type"];
      logger.debug(
        `Fetching unread notification count for user: ${userId}${
          type ? `, type: ${type}` : ""
        }`
      );

      if (!userId) {
        logger.error("Missing userId");
        throw new HttpError("userId is required", StatusCodes.BAD_REQUEST)
      }

      // Allow admins to fetch notification counts
      if (!req.currentUser) {
        logger.info(
          `No unread count for unauthenticated user, userId: ${userId}`
        );
        this.sendSuccess(res, { count: 0 }, "No notifications available");
        return;
      }

      const count = await this._notificationService.getUnreadCount(userId, type);
      this.sendSuccess(res, { count }, "Unread notification count fetched successfully");

    } catch (error: any) {
      logger.error(
        `Error fetching unread notification count: ${error.message}`
      );
      next(error)
    }
  };
}
