import { IMentor } from "./i-mentor.js";
import { IUser } from "./i-user.js";
import { Document, Types } from "mongoose";

export interface ICollaboration extends Document {
  _id: Types.ObjectId;
  collaborationId: string;
  mentorId: IMentor | string | Types.ObjectId;
  userId: IUser | string | Types.ObjectId;
  selectedSlot: {
    day:string;
    timeSlots: string[];
  }[];
  unavailableDays: {
    _id: Types.ObjectId;
    datesAndReasons: { date: Date; reason: string }[];
    requestedBy: "user" | "mentor";
    requesterId: Types.ObjectId;
    isApproved: "pending" | "approved" | "rejected";
    approvedById: Types.ObjectId;
  }[];
  temporarySlotChanges: {
    _id: Types.ObjectId;
    datesAndNewSlots: { date: Date; newTimeSlots: string[] }[];
    requestedBy: "user" | "mentor";
    requesterId: Types.ObjectId;
    isApproved: "pending" | "approved" | "rejected";
    approvedById: Types.ObjectId;
  }[];
  price: number;
  payment: boolean;
  paymentIntentId:string;
  isCancelled: boolean;
  isCompleted:boolean;
  startDate: Date;
  endDate?: Date;
  feedbackGiven: boolean;
  createdAt: Date;
}
