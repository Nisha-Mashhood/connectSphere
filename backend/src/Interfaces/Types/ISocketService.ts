export interface CallOffer {
  senderId: string;
  targetId: string;
  type: string;
  chatKey: string;
  callType: 'audio' | 'video';
  recipientIds: string[];
  endTimeout: NodeJS.Timeout;
}

export interface Message {
  senderId: string;
  targetId: string;
  type: 'group' | 'user-mentor' | 'user-user';
  content: string;
  contentType?: string;
  collaborationId?: string;
  userConnectionId?: string;
  groupId?: string;
  _id?: string;
  thumbnailUrl?: string;
  fileMetadata?: { fileName: string; fileSize: number; mimeType: string };
}

export interface TypingData {
  userId: string;
  targetId: string;
  type: 'group' | 'user-mentor' | 'user-user';
  chatKey: string;
}

export interface MarkAsReadData {
  chatKey: string;
  userId: string;
  type: 'group' | 'user-mentor' | 'user-user';
}

export interface CallData {
  userId: string;
  targetId: string;
  type: string;
  chatKey: string;
  callType: 'audio' | 'video';
  offer?: RTCSessionDescriptionInit;
  answer?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
}

export interface GroupIceCandidateData {
  groupId: string;
  senderId: string;
  recipientId: string;
  candidate: RTCIceCandidateInit;
  callType: 'audio' | 'video';
  callId: string;
}