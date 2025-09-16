import { Types } from "mongoose";
import { IAppNotification } from "../Models/IAppNotification";
import { ITask } from "../../Interfaces/Models/ITask";
import { UserIds } from "../../Utils/Types/Notification.types";

export interface INotificationRepository {
  getTasksForNotification(taskId: string): Promise<ITask | null>;
  getAllTasksForNotification(): Promise<ITask[]>;
  getGroupMembers(groupId: string): Promise<Types.ObjectId[]>;
  getMentorIdAndUserId(collaborationId: string): Promise<UserIds | null>;
  getConnectionUserIds(connectionId: string): Promise<{ requester: string; recipient: string } | null>;
  findTaskNotification(
    userId: string,
    taskId: string,
    notificationDate?: string,
    notificationTime?: string
  ): Promise<IAppNotification | null>;
  updateNotificationStatus(notificationId: string, status: "unread" | "read"): Promise<IAppNotification | null>;
  updateTaskNotifications(relatedId: string, notificationDate?: Date, notificationTime?: string): Promise<{ modifiedCount: number }>;
  createNotification(notification: Partial<IAppNotification>): Promise<IAppNotification>;
  findNotificationByUserId(userId: string): Promise<IAppNotification[]>;
  findNotificationByCallId(userId: string, callId: string): Promise<IAppNotification | null>;
  updateNotificationToMissed(userId: string, callId: string, content: string): Promise<IAppNotification | null>;
  markNotificationAsRead(notificationId: string): Promise<IAppNotification | null>;
  getNotificationUnreadCount(userId: string, type?: IAppNotification["type"]): Promise<number>;
  findNotificationByRelatedId(relatedId: string, options: { userId: string; type: string }): Promise<IAppNotification | null>;
  updateNotificationById(notificationId: string, updateData: Partial<IAppNotification>): Promise<IAppNotification | null>;
}