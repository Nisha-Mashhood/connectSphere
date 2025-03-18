import mongoose, { Document } from "mongoose";
import { IMentor } from "./mentor.model.js";
import { UserInterface } from "./user.model.js";
export interface ICollaboration extends Document {
    mentorId: IMentor | string;
    userId: UserInterface | string;
    selectedSlot: {
        day: "Sunday" | "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday";
        timeSlots: string[];
    }[];
    unavailableDays: {
        _id: mongoose.Types.ObjectId;
        datesAndReasons: {
            date: Date;
            reason: string;
        }[];
        requestedBy: "user" | "mentor";
        requesterId: mongoose.Types.ObjectId;
        isApproved: "pending" | "approved" | "rejected";
        approvedById: mongoose.Types.ObjectId;
    }[];
    temporarySlotChanges: {
        _id: mongoose.Types.ObjectId;
        datesAndNewSlots: {
            date: Date;
            newTimeSlots: string[];
        }[];
        requestedBy: "user" | "mentor";
        requesterId: mongoose.Types.ObjectId;
        isApproved: "pending" | "approved" | "rejected";
        approvedById: mongoose.Types.ObjectId;
    }[];
    price: number;
    payment: boolean;
    isCancelled: boolean;
    startDate: Date;
    endDate?: Date;
    feedbackGiven: boolean;
    createdAt: Date;
}
declare const _default: mongoose.Model<ICollaboration, {}, {}, {}, mongoose.Document<unknown, {}, ICollaboration> & ICollaboration & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=collaboration.d.ts.map