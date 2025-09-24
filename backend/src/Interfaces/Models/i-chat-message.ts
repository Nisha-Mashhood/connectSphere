import { Document, Types } from "mongoose";

export interface IChatMessage extends Document {
  _id: Types.ObjectId;
  ChatId: string;
  senderId: Types.ObjectId | string;
  content: string;
  thumbnailUrl?: string;
  collaborationId?: Types.ObjectId | string; // For user-mentor chats
  userConnectionId?: Types.ObjectId | string; // For user-user chats
  groupId?: Types.ObjectId | string; // For group chats
  contentType: "text" | "image" | "video" | "file";
  fileMetadata?: {
    fileName: string | undefined;
    fileSize: number | undefined;
    mimeType: string | undefined;
  };
  isRead: boolean;
  status: "pending" | "sent" | "read";
  timestamp: Date;
}
