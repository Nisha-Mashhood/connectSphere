import { IAppNotification } from "../Models/IAppNotification";
import { TaskNotificationPayload } from "../../Utils/Types/Notification.types";
import { Server } from "socket.io";

export interface INotificationService {
  initializeSocket: (_io: Server) => void;
  stopNotificationInterval: () => void;
  sendTaskNotification: (
    taskId: string,
    specificUserId?: string,
    notificationDate?: string,
    notificationTime?: string
  ) => Promise<TaskNotificationPayload[]>;
  checkAndSendNotifications: () => Promise<TaskNotificationPayload[]>;
  sendNotification: (
    userId: string,
    notificationType: IAppNotification["type"],
    senderId: string,
    relatedId: string,
    contentType?: string,
    callId?: string,
    callType?: IAppNotification["callType"],
    customContent?: string
  ) => Promise<IAppNotification>;
  updateCallNotificationToMissed: (
    userId: string,
    callId: string,
    content: string
  ) => Promise<IAppNotification | null>;
  getNotifications: (userId: string) => Promise<IAppNotification[]>;
  markNotificationAsRead: (
    notificationId?: string,
    userId?: string,
    type?: IAppNotification["type"]
  ) => Promise<IAppNotification[]>;
  getUnreadCount: (userId: string, type?: IAppNotification["type"]) => Promise<number>;
}