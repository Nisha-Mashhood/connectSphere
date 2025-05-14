import mongoose, { Document } from "mongoose";
export interface IChatMessage extends Document {
    ChatId: string;
    senderId: mongoose.Types.ObjectId;
    content: string;
    thumbnailUrl?: string;
    collaborationId?: mongoose.Types.ObjectId;
    userConnectionId?: mongoose.Types.ObjectId;
    groupId?: mongoose.Types.ObjectId;
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
declare const _default: mongoose.Model<IChatMessage, {}, {}, {}, mongoose.Document<unknown, {}, IChatMessage> & IChatMessage & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=chat.model.d.ts.map