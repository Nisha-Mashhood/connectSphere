import mongoose, { Document } from 'mongoose';
export interface GroupRequestDocument extends Document {
    groupId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    status: 'Pending' | 'Approved' | 'Rejected';
    paymentStatus: 'Pending' | 'Completed' | 'Failed';
    paymentId?: string;
    amountPaid?: number;
    createdAt: Date;
}
declare const GroupRequest: mongoose.Model<GroupRequestDocument, {}, {}, {}, mongoose.Document<unknown, {}, GroupRequestDocument> & GroupRequestDocument & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default GroupRequest;
//# sourceMappingURL=groupRequest.model.d.ts.map