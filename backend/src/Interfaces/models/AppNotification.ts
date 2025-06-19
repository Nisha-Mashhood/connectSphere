import { Document, Types } from "mongoose";

export interface AppNotification extends Document {
  _id: Types.ObjectId;
  AppNotificationId: string;
  userId: string | Types.ObjectId;
  type: 'message' | 'incoming_call' | 'missed_call' | 'task_reminder' ;
  content: string;
  relatedId: string;
  senderId: string | Types.ObjectId;
  status: 'unread' | 'read';
  callId?: string;
  notificationDate?: Date;
  notificationTime?: string;
  createdAt: Date;
  updatedAt: Date;
  taskContext?: {
    contextType: 'profile' | 'group' | 'collaboration' | 'userconnection';
    contextId: string;
  };
}