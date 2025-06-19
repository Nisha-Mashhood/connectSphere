import { Document, Types } from "mongoose";
export interface GroupRequestDocument extends Document {
    _id: Types.ObjectId;
    groupRequestId: string;
    groupId: Types.ObjectId;
    userId: Types.ObjectId;
    status: "Pending" | "Accepted" | "Rejected";
    paymentStatus: "Pending" | "Completed" | "Failed";
    paymentId?: string;
    amountPaid?: number;
    createdAt: Date;
}
//# sourceMappingURL=GroupRequestDocument.d.ts.map