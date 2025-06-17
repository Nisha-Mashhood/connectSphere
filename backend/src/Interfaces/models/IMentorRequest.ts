import { Document, Types } from "mongoose";

export interface IMentorRequest extends Document {
  _id: Types.ObjectId;
  mentorRequestId: string;
  mentorId: Types.ObjectId;
  userId: Types.ObjectId;
  selectedSlot: object;
  price: number;
  timePeriod: number;
  paymentStatus: "Pending" | "Paid" | "Failed";
  isAccepted: String;
  createdAt: Date;
  updatedAt: Date;
}
