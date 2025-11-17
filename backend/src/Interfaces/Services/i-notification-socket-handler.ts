import { Server, Socket } from "socket.io";
import { TaskNotificationPayload } from "../../Utils/types/notification-types";
import { IAppNotification } from "../Models/i-app-notification";

export interface INotificationSocketHandler {
  initializeSocket(io: Server): void;
  handleNotificationRead(
    socket: Socket,
    data: { notificationId?: string; userId?: string; type?: IAppNotification["type"] }
  ): Promise<void>;
  emitTaskNotification(notification: TaskNotificationPayload): void;
}