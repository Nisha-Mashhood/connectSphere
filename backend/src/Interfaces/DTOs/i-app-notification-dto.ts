import { IUserDTO } from './i-user-dto';

export interface IAppNotificationDTO {
  id: string;
  AppNotificationId: string;
  userId: string; // Always include as string
  user?: IUserDTO; // Populated user details when available
  type: 'message' | 'incoming_call' | 'missed_call' | 'task_reminder' | 'new_user' | 'new_mentor' | 'mentor_approved' | 'collaboration_status';
  content: string;
  relatedId: string;
  senderId: string; // Always include as string
  sender?: IUserDTO; // Populated sender details when available
  status: 'unread' | 'read';
  callId?: string;
  callType?: 'audio' | 'video';
  notificationDate?: string;
  notificationTime?: string;
  createdAt: Date;
  updatedAt: Date;
  taskContext?: {
    contextType: 'user' | 'group' | 'collaboration' | 'userconnection';
    contextId: string;
  };
}