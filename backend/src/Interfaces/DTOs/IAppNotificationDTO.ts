export interface IAppNotificationDTO {
  id: string;
  userId: string;
  type: 'message' | 'incoming_call' | 'missed_call' | 'task_reminder' | 'new_user' | 'new_mentor' | 'mentor_approved' | 'collaboration_status';
  content: string;
  relatedId: string;
  senderId: string;
  status: 'unread' | 'read';
  callId?: string;
  callType?: 'audio' | 'video';
  notificationDate?: Date;
  notificationTime?: string;
  createdAt: Date;
  updatedAt: Date;
  taskContext?: {
    contextType: 'profile' | 'group' | 'collaboration' | 'userconnection';
    contextId: string;
  };
}