import { Server, Socket } from "socket.io";
import logger from "../core/utils/logger";
import { IAppNotification } from "../Interfaces/Models/i-app-notification";
import { TaskNotificationPayload } from "../Utils/types/notification-types";
import { inject, injectable } from "inversify";
import { INotificationSocketHandler } from "../Interfaces/Services/i-notification-socket-handler";
import { INotificationService } from "../Interfaces/Services/i-notification-service";

@injectable()
export class NotificationSocketHandler implements INotificationSocketHandler{
  // private _sentNotifications: Set<string> = new Set();
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
      const updatedNotifications = await this._notificationService.markNotificationAsRead(
        notificationId,
        userId,
        type
      );

      if (updatedNotifications.length > 0 && this._io && userId) {
        // Emit to the user that some notifications were read
        this._io.to(`user_${userId}`).emit("notification.read", {
          notificationIds: updatedNotifications.map(n => n.id),
        });
        logger.info(`Marked ${updatedNotifications.length} notifications as read for user ${userId}`);
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

    const room = `user_${notification.userId}`;
    this._io.to(room).emit("notification.new", notification);
    logger.info(`Emitted notification.new to user_${notification.userId}: ${notification._id} (${notification.type})`);
  }
}