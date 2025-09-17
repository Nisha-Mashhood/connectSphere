import { Server, Socket } from "socket.io";
import { TaskNotificationPayload } from "../../Utils/Types/Notification.types";
import { IAppNotification } from "../../Interfaces/Models/IAppNotification";

export interface INotificationSocketHandler {
  initializeSocket(io: Server): void;
  handleNotificationRead(
    socket: Socket,
    data: { notificationId?: string; userId?: string; type?: IAppNotification["type"] }
  ): Promise<void>;
  emitTaskNotification(notification: TaskNotificationPayload): void;
}