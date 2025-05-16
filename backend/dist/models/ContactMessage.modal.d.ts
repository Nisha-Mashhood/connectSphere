import mongoose, { Document } from "mongoose";
export interface IContactMessage extends Document {
    contactMessageId: string;
    name: string;
    email: string;
    message: string;
    givenReply: boolean;
    createdAt: Date;
}
declare const _default: mongoose.Model<IContactMessage, {}, {}, {}, mongoose.Document<unknown, {}, IContactMessage> & IContactMessage & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=ContactMessage.modal.d.ts.map