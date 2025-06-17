import { Document, Types } from "mongoose";

export interface AppNotification extends Document {
  _id: string;
  AppNotificationId: string;
  userId: string | Types.ObjectId;
  type: "message" | "incoming_call" | "missed_call" | "task_reminder";
  content: string;
  relatedId: string; // chatKey for messages/calls, taskId for tasks
  senderId: string | Types.ObjectId;
  status: "unread" | "read";
  callId?: string;
  notificationDate?: Date;
  notificationTime?: string;
  createdAt: Date;
  updatedAt: Date;
  taskContext?: {
    contextType: "profile" | "group" | "collaboration" | "userconnection";
    contextId: string;
  };
}
