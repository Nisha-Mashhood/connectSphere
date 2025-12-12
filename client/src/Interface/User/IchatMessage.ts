export interface IChatMessage {
  _id: string;
  senderId: string;
  content: string;
  thumbnailUrl?: string;
  collaborationId?: string;
  userConnectionId?: string;
  groupId?: string;
  contentType: "text" | "image" | "video" | "file";
  fileMetadata?: {
    fileName: string;
    fileSize: number;
    mimeType: string;
  };
  isRead: boolean;
  status: "pending" | "sent" | "read";
  timestamp: string;
  caption?: string;
  createdAt?:string;
}


export interface ILastMessageSummary {
  content: string;
  senderId: string;
  timestamp: string;
  contentType: "text" | "image" | "video" | "file";
}