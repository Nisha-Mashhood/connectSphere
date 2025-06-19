import { Document, Types } from "mongoose";
export interface TimeSlot {
    day: string;
    timeSlots: string[];
}
export interface GroupDocument extends Document {
    _id: Types.ObjectId;
    groupId: string;
    name: string;
    bio: string;
    price: number;
    maxMembers: number;
    isFull: boolean;
    availableSlots: TimeSlot[];
    profilePic: string;
    coverPic: string;
    startDate: Date;
    adminId: Types.ObjectId;
    members: {
        userId: Types.ObjectId;
        joinedAt: Date;
    }[];
    createdAt: Date;
}
//# sourceMappingURL=GroupDocument.d.ts.map