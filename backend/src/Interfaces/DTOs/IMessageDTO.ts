export interface IMessageDTO {
  id: string;
  messageId: string;
  senderId: string;
  contactId: string;
  content: string;
  contentType: "text" | "image" | "file";
  fileMetadata?: {
    fileName?: string;
    fileSize?: number;
    mimeType?: string;
  };
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}
