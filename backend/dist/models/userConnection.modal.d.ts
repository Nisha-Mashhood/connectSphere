import mongoose, { Document } from "mongoose";
import { UserInterface } from "./user.model.js";
export interface IUserConnection extends Document {
    connectionId: string;
    requester: string | UserInterface;
    recipient: string | UserInterface;
    requestStatus: "Pending" | "Accepted" | "Rejected";
    connectionStatus: "Connected" | "Disconnected";
    requestSentAt: Date;
    requestAcceptedAt?: Date;
    disconnectedAt?: Date;
    disconnectionReason?: string;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IUserConnection, {}, {}, {}, mongoose.Document<unknown, {}, IUserConnection> & IUserConnection & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=userConnection.modal.d.ts.map