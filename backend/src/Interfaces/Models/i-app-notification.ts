import { Document, Types } from "mongoose";

export interface IAppNotification extends Document {
  _id: Types.ObjectId;
  AppNotificationId: string;
  userId: string | Types.ObjectId;
  type: 'message' | 'incoming_call' | 'missed_call' | 'task_reminder' | 'new_user'| 'new_mentor' | 'mentor_approved' | 'collaboration_status' ;
  content: string;
  relatedId: string;
  senderId: string | Types.ObjectId;
  status: 'unread' | 'read';
  callId?: string;
  callType?: 'audio' | 'video';
  notificationDate?: Date;
  notificationTime?: string;
  createdAt: Date;
  updatedAt: Date;
  taskContext?: {
    contextType: 'user' | 'group' | 'collaboration' | 'userconnection';
    contextId: string;
  };
}