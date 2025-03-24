import mongoose, { Document } from "mongoose";
export interface IMessage extends Document {
    _id: mongoose.Types.ObjectId;
    messageId: string;
    senderId: mongoose.Types.ObjectId;
    contactId: mongoose.Types.ObjectId;
    content: string;
    contentType: "text" | "image" | "file";
    fileMetadata?: {
        fileName: string;
        fileSize: number;
        mimeType: string;
    };
    isRead: boolean;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IMessage, {}, {}, {}, mongoose.Document<unknown, {}, IMessage> & IMessage & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=messages.model.d.ts.map