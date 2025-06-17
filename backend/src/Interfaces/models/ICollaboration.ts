import { IMentor } from "./IMentor.js";
import { UserInterface } from "./IUser.js";
import { Document, Types } from "mongoose";

export interface ICollaboration extends Document {
  _id: Types.ObjectId;
  collaborationId: string;
  mentorId: IMentor | string;
  userId: UserInterface | string;
  selectedSlot: {
    day:
      | "Sunday"
      | "Monday"
      | "Tuesday"
      | "Wednesday"
      | "Thursday"
      | "Friday"
      | "Saturday";
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
  isCancelled: boolean;
  startDate: Date;
  endDate?: Date;
  feedbackGiven: boolean;
  createdAt: Date;
}
