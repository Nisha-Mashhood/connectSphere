import { Document, Types } from "mongoose";
import { IUser } from "./i-user";
import { IMentor } from "./i-mentor";

export interface IMentorRequest extends Document {
  _id: Types.ObjectId;
  mentorRequestId: string;
  mentorId: Types.ObjectId | IMentor;
  userId: Types.ObjectId | IUser;
  selectedSlot: {
    day: string;
    timeSlots: string[];
  };
  price: number;
  timePeriod: number;
  paymentStatus: "Pending" | "Paid" | "Failed";
  isAccepted: "Pending" | "Accepted" | "Rejected";
  createdAt: Date;
  updatedAt: Date;
}
