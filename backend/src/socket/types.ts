export interface Message {
  senderId: string;
  targetId: string;
  type: "group" | "user-mentor" | "user-user";
  content: string;
  contentType?: "text" | "image" | "video" | "audio" | "file";
  collaborationId?: string;
  userConnectionId?: string;
  groupId?: string;
  _id?: string;
  thumbnailUrl?: string;
  fileMetadata?: any;
}

export interface TypingData {
  userId: string;
  targetId: string;
  type: "group" | "user-mentor" | "user-user";
  chatKey: string;
}

export interface MarkAsReadData {
  chatKey: string;
  userId: string;
  type: "group" | "user-mentor" | "user-user";
}

export interface CallData {
  userId: string;
  targetId: string;
  type: "group" | "user-mentor" | "user-user";
  chatKey: string;
  offer?: RTCSessionDescriptionInit;
  answer?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
  callType: "audio" | "video";
}

export interface CallOffer {
  senderId: string;
  targetId: string;
  type: string;
  chatKey: string;
  callType: "audio" | "video";
  recipientIds: string[];
  endTimeout: NodeJS.Timeout;
}

export interface GroupIceCandidateData {
  groupId: string;
  senderId: string;
  recipientId: string;
  candidate: RTCIceCandidateInit;
  callType: "audio" | "video";
  callId: string;
}

export interface AppNotification {
  _id: string;
  userId: string;
  type: "message" | "incoming_call" | "missed_call" | string;
  relatedId: string;
  senderId: string;
  contentType?: string;
  callId?: string;
  status: "unread" | "read";
}


//one-one call
export interface CallCreatedEvent {
  callId: string;
  chatKey: string;
  callType: "audio" | "video";
  type: "group" | "user-mentor" | "user-user";
  senderId: string;
  recipientIds: string[];
  groupId?: string;
  callerName?: string;
  createdAt: string;
}