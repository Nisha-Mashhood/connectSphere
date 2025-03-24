import mongoose, { Document } from "mongoose";
export interface IContact extends Document {
    _id: mongoose.Types.ObjectId;
    contactId: string;
    userId: string | mongoose.Types.ObjectId;
    targetUserId?: string | mongoose.Types.ObjectId;
    collaborationId?: string | mongoose.Types.ObjectId;
    userConnectionId?: string | mongoose.Types.ObjectId;
    groupId?: string | mongoose.Types.ObjectId;
    type: "user-mentor" | "user-user" | "group";
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IContact, {}, {}, {}, mongoose.Document<unknown, {}, IContact> & IContact & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=contacts.model.d.ts.map