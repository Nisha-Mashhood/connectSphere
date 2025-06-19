import { Document, Types } from "mongoose";
export interface IMentorRequest extends Document {
    _id: Types.ObjectId;
    mentorRequestId: string;
    mentorId: Types.ObjectId;
    userId: Types.ObjectId;
    selectedSlot: {
        day: 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
        timeSlots: string[];
    };
    price: number;
    timePeriod: number;
    paymentStatus: "Pending" | "Paid" | "Failed";
    isAccepted: String;
    createdAt: Date;
    updatedAt: Date;
}
//# sourceMappingURL=IMentorRequest.d.ts.map