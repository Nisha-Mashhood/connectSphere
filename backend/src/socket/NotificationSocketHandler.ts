import { Server, Socket } from "socket.io";
import logger from "../core/Utils/Logger";
import { NotificationService, TaskNotificationPayload } from "../Modules/Notification/Service/NotificationService";
import { AppNotification } from "../Interfaces/models/AppNotification";

export class NotificationSocketHandler {
  private sentNotifications: Set<string> = new Set();
  private notificationService: NotificationService;
  private io: Server | null = null;

  constructor(notificationService: NotificationService) {
    this.notificationService = notificationService;
  }

  public initializeSocket(io: Server): void {
    this.io = io;
    this.notificationService.initializeSocket(io);
  }

  public async handleNotificationRead(
    socket: Socket,
    data: { notificationId?: string; userId?: string; type?: AppNotification['type'] }
  ): Promise<void> {
    try {
      const { notificationId, userId, type } = data;
      const notification = await this.notificationService.markNotificationAsRead(notificationId, userId, type);
      if (!notification) {
      logger.warn(`No notifications found for ${notificationId || type}`);
      return;
    }
      if (notification && this.io) {
        this.io
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
    if (!this.io) {
      logger.error("Socket.IO server not initialized");
      return;
    }
    if (this.sentNotifications.has(notification._id)) {
      logger.info(`Skipping duplicate notification.new: ${notification._id}`);
      return;
    }
    const room = `user_${notification.userId}`;
    this.io.to(room).emit("notification.new", notification);
    this.sentNotifications.add(notification._id);
    logger.info(
      `Emitted notification.new to user_${notification.userId}: ${notification._id}`
    );
    setTimeout(
      () => this.sentNotifications.delete(notification._id),
      300 * 1000
    );
  }
}