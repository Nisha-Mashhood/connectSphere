import mongoose, { Document } from "mongoose";
import { UserInterface } from "./user.model.js";
export interface IMentor extends Document {
    userId: string | UserInterface;
    isApproved?: string;
    rejectionReason?: string;
    skills?: string[];
    certifications?: string[];
    specialization?: string;
    bio: string;
    price: number;
    availableSlots?: object[];
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IMentor, {}, {}, {}, mongoose.Document<unknown, {}, IMentor> & IMentor & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=mentor.model.d.ts.map