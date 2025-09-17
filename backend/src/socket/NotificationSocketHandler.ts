import { Server, Socket } from "socket.io";
import logger from "../Core/Utils/Logger";
import { IAppNotification } from "../Interfaces/Models/IAppNotification";
import { TaskNotificationPayload } from "../Utils/Types/Notification.types";
import { inject, injectable } from "inversify";
import { INotificationSocketHandler } from "../Interfaces/Services/INotificationSocketHandler";
import { INotificationService } from "../Interfaces/Services/INotificationService";

@injectable()
export class NotificationSocketHandler implements INotificationSocketHandler{
  private _sentNotifications: Set<string> = new Set();
  private _notificationService: INotificationService;
  private _io: Server | null = null;

  constructor(@inject("INotificationService") notificationService: INotificationService) {
    this._notificationService = notificationService;
  }

  public initializeSocket(io: Server): void {
    this._io = io;
    this._notificationService.initializeSocket(io);
  }

  public async handleNotificationRead(
    socket: Socket,
    data: { notificationId?: string; userId?: string; type?: IAppNotification['type'] }
  ): Promise<void> {
    try {
      const { notificationId, userId, type } = data;
      const notification = await this._notificationService.markNotificationAsRead(notificationId, userId, type);
      if (!notification) {
      logger.warn(`No notifications found for ${notificationId || type}`);
      return;
    }
      if (notification && this._io) {
        this._io
          .to(`user_${userId}`)
          .emit("notification.read", { notificationId });
        logger.info(
          `Notification marked as read: ${notificationId} for user ${userId}`
        );
      }
    } catch (error: any) {
      logger.error(`Error handling notification.read: ${error.message}`);
      socket.emit("error", { message: "Failed to mark notification as read" });
    }
  }

  public emitTaskNotification(notification: TaskNotificationPayload): void {
    if (!this._io) {
      logger.error("Socket.IO server not initialized");
      return;
    }
    if (this._sentNotifications.has(notification._id)) {
      logger.info(`Skipping duplicate notification.new: ${notification._id}`);
      return;
    }
    const room = `user_${notification.userId}`;
    this._io.to(room).emit("notification.new", notification);
    this._sentNotifications.add(notification._id);
    logger.info(
      `Emitted notification.new to user_${notification.userId}: ${notification._id}`
    );
    setTimeout(
      () => this._sentNotifications.delete(notification._id),
      300 * 1000
    );
  }
}