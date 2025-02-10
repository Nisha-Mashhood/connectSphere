import mongoose, { Document } from "mongoose";
import { IMentor } from "./mentor.model.js";
import { UserInterface } from "./user.model.js";
export interface ICollaboration extends Document {
    mentorId: IMentor | string;
    userId: UserInterface | string;
    selectedSlot: object[];
    price: number;
    payment: boolean;
    isCancelled: boolean;
    startDate: Date;
    endDate?: Date;
    createdAt: Date;
}
declare const _default: mongoose.Model<ICollaboration, {}, {}, {}, mongoose.Document<unknown, {}, ICollaboration> & ICollaboration & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=collaboration.d.ts.map