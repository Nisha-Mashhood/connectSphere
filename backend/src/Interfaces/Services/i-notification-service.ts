import { IAppNotification } from "../Models/i-app-notification";
import { TaskNotificationPayload } from "../../Utils/types/notification-types";
import { Server } from "socket.io";
import { IAppNotificationDTO } from "../DTOs/i-app-notification-dto";

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
  ) => Promise<IAppNotificationDTO>;
  updateCallNotificationToMissed: (
    userId: string,
    callId: string,
    content: string
  ) => Promise<IAppNotificationDTO | null>;
  getNotifications: (userId: string) => Promise<IAppNotificationDTO[]>;
  markNotificationAsRead: (
    notificationId?: string,
    userId?: string,
    type?: IAppNotification["type"]
  ) => Promise<IAppNotificationDTO[]>;
  getUnreadCount: (userId: string, type?: IAppNotification["type"]) => Promise<number>;
}