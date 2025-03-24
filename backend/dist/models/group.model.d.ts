import mongoose, { Document } from 'mongoose';
export interface TimeSlot {
    day: string;
    timeSlots: string[];
}
export interface GroupDocument extends Document {
    groupId: string;
    name: string;
    bio: string;
    price: number;
    maxMembers: number;
    availableSlots: TimeSlot[];
    profilePic: string;
    coverPic: string;
    startDate: Date;
    adminId: mongoose.Types.ObjectId;
    members: {
        userId: mongoose.Types.ObjectId;
        joinedAt: Date;
    }[];
    createdAt: Date;
}
declare const Group: mongoose.Model<GroupDocument, {}, {}, {}, mongoose.Document<unknown, {}, GroupDocument> & GroupDocument & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default Group;
//# sourceMappingURL=group.model.d.ts.map