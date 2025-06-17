import { Document, Types } from "mongoose";

export interface IChatMessage extends Document {
  _id: Types.ObjectId;
  ChatId: string;
  senderId: Types.ObjectId;
  content: string;
  thumbnailUrl?: string;
  collaborationId?: Types.ObjectId; // For user-mentor chats
  userConnectionId?: Types.ObjectId; // For user-user chats
  groupId?: Types.ObjectId; // For group chats
  contentType: "text" | "image" | "video" | "file";
  fileMetadata?: {
    fileName: string;
    fileSize: number;
    mimeType: string;
  };
  isRead: boolean;
  status: "pending" | "sent" | "read";
  timestamp: Date;
}
