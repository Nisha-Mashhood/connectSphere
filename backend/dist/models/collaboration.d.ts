import mongoose, { Document } from "mongoose";
export interface ICollaboration extends Document {
    mentorId: string;
    userId: string;
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