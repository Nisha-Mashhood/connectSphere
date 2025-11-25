export interface Notification {
  id: string;
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
  status: "unread" | "read";
  callId?: string;
  callType?: "audio" | "video";
  senderId: string;
  createdAt: string;
  updatedAt: string;
  
  taskContext?: {
    contextType: "user" | "group" | "collaboration";
    contextId: string;
  };
}
