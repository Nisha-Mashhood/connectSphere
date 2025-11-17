import { NextFunction, Request, Response } from "express";
import { inject, injectable } from "inversify";
import logger from "../core/utils/logger";
import { IAppNotification } from "../Interfaces/Models/i-app-notification";
import { INotificationController } from "../Interfaces/Controller/i-notification-controller";
import { StatusCodes } from "../enums/status-code-enums";
import { BaseController } from "../core/controller/base-controller";
import { HttpError } from "../core/utils/error-handler";
import { INotificationService } from "../Interfaces/Services/i-notification-service";
import { ERROR_MESSAGES } from "../constants/error-messages";
import { NOTIFICATION_MESSAGES } from "../constants/messages";

@injectable()
export class NotificationController extends BaseController implements INotificationController{
  private _notificationService: INotificationService;

  constructor(@inject('INotificationService') notificationService : INotificationService) {
    super();
    this._notificationService = notificationService;
  }

  getNotifications = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.query.userId as string;
      logger.debug(`Fetching notifications for user: ${userId}`);

      if (!userId) {
        logger.error("Missing userId");
        throw new HttpError(ERROR_MESSAGES.REQUIRED_USER_ID, StatusCodes.BAD_REQUEST);
      }

      if (!req.currentUser || req.currentUser.role === "admin") {
        logger.info(
          `No notifications for ${
            req.currentUser ? "admin" : "unauthenticated user"
          }, userId: ${userId}`
        );
        this.sendSuccess(res, [], NOTIFICATION_MESSAGES.NO_NOTIFICATIONS_AVAILABLE);
        return;
      }

      const notifications = await this._notificationService.getNotifications(userId);
      this.sendSuccess(res, notifications, NOTIFICATION_MESSAGES.NOTIFICATIONS_FETCHED);
    } catch (error: any) {
      logger.error(`Error fetching notifications: ${error.message}`);
      next(error);
    }
  };

  markAsRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const notificationId = req.query.notificationId as string | undefined;
      const userId = req.query.userId as string | undefined;
      const type = req.query.type as IAppNotification["type"] | undefined;

      logger.info(`Notification Id ${notificationId} userId ${userId} type ${type}`);

      if (type && (!req.currentUser || req.currentUser.role !== "admin")) {
        logger.info(
          `No action for ${
            req.currentUser ? "non-admin" : "unauthenticated user"
          } marking notifications by type: ${type}`
        );
        throw new HttpError(ERROR_MESSAGES.ONLY_ADMINS_CAN_MARK_BY_TYPE, StatusCodes.FORBIDDEN);
      }

      if (type && !userId) {
        logger.error("userId is required when marking notifications by type");
        throw new HttpError(ERROR_MESSAGES.REQUIRED_USER_ID_FOR_TYPE, StatusCodes.BAD_REQUEST);
      }

      const result = await this._notificationService.markNotificationAsRead(notificationId, userId, type);

      this.sendSuccess(
        res,
        result || [],
        notificationId
          ? NOTIFICATION_MESSAGES.NOTIFICATION_MARKED_AS_READ
          : NOTIFICATION_MESSAGES.NOTIFICATIONS_MARKED_AS_READ
      );
    } catch (error: any) {
      logger.error(`Error marking notification(s) as read: ${error.message}`);
      next(error);
    }
  };

  getUnreadCount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.query.userId as string;
      const type = req.query.type as IAppNotification["type"];
      logger.debug(`Fetching unread notification count for user: ${userId}${type ? `, type: ${type}` : ""}`);

      if (!userId) {
        logger.error("Missing userId");
        throw new HttpError(ERROR_MESSAGES.REQUIRED_USER_ID, StatusCodes.BAD_REQUEST);
      }

      if (!req.currentUser) {
        logger.info(`No unread count for unauthenticated user, userId: ${userId}`);
        this.sendSuccess(res, { count: 0 }, NOTIFICATION_MESSAGES.NO_NOTIFICATIONS_AVAILABLE);
        return;
      }

      const count = await this._notificationService.getUnreadCount(userId, type);
      this.sendSuccess(res, { count }, NOTIFICATION_MESSAGES.UNREAD_COUNT_FETCHED);
    } catch (error: any) {
      logger.error(`Error fetching unread notification count: ${error.message}`);
      next(error);
    }
  };
}
