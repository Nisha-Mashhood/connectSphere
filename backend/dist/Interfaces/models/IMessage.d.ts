import { Document, Types } from "mongoose";
export interface IMessage extends Document {
    _id: Types.ObjectId;
    messageId: string;
    senderId: Types.ObjectId;
    contactId: Types.ObjectId;
    content: string;
    contentType: "text" | "image" | "file";
    fileMetadata?: {
        fileName: string | undefined;
        fileSize: number | undefined;
        mimeType: string | undefined;
    };
    isRead: boolean;
    createdAt: Date;
    updatedAt: Date;
}
//# sourceMappingURL=IMessage.d.ts.map