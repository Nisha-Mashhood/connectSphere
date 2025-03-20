import mongoose, { Document } from "mongoose";
export interface IMentorRequest extends Document {
    mentorId: string;
    userId: string;
    selectedSlot: object;
    price: number;
    timePeriod: number;
    paymentStatus: "Pending" | "Paid" | "Failed";
    isAccepted: String;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IMentorRequest, {}, {}, {}, mongoose.Document<unknown, {}, IMentorRequest> & IMentorRequest & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=mentorRequset.d.ts.map