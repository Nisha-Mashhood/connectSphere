export interface IChatMessageDTO {
  id: string;
  senderId: string;
  contentUrl: string;    
  thumbnailUrl?: string;
  collaborationId?: string;
  userConnectionId?: string;
  groupId?: string;
  contentType: "text" | "image" | "video" | "file";
  fileMetadata?: {
    fileName?: string;
    fileSize?: number;
    mimeType?: string;
  };
  isRead: boolean;
  status: "pending" | "sent" | "read";
  timestamp: Date;
}