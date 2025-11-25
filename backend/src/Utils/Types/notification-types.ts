import { Types } from "mongoose";
import { IMentor } from "../../Interfaces/Models/i-mentor";

export interface CollaborationData {
  userId: Types.ObjectId;
  mentorId: IMentor;
}

export interface UserIds {
  userId: string;
  mentorUserId: string | null;
}

export interface TaskNotificationPayload {
  _id: string;
  userId: string;
  type:
    | "message"
    | "incoming_call"
    | "missed_call"
    | "task_reminder"
    | "new_user"
    | "new_mentor"
    | "mentor_approved"
    | "collaboration_status";
  content: string;
  relatedId: string;
  senderId: string;
  status: "unread" | "read";
  callId?: string;
  callType?: 'audio' | 'video';
  notificationDate?: string;
  notificationTime?: string;
  createdAt: Date;
  updatedAt: Date;
  taskContext?: {
    contextType: "user" | "group" | "collaboration" | "userconnection";
    contextId: string;
  };
}