import { Document, Types } from "mongoose";

export interface IGroupRequest extends Document {
  _id: Types.ObjectId;
  groupRequestId: string;
  groupId: Types.ObjectId; //  the group
  userId: Types.ObjectId; //  the user who sent the request
  status: "Pending" | "Accepted" | "Rejected"; // Request status
  paymentStatus: "Pending" | "Completed" | "Failed"; // Payment status
  paymentId?: string;
  amountPaid?: number; // Amount paid by the user
  createdAt: Date;
}
