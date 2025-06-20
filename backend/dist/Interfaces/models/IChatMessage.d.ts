import { Document, Types } from "mongoose";
export interface IChatMessage extends Document {
    _id: Types.ObjectId;
    ChatId: string;
    senderId: Types.ObjectId;
    content: string;
    thumbnailUrl?: string;
    collaborationId?: Types.ObjectId;
    userConnectionId?: Types.ObjectId;
    groupId?: Types.ObjectId;
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
//# sourceMappingURL=IChatMessage.d.ts.map