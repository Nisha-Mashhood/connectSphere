import { Document, Types } from "mongoose";
import { UserInterface } from "./IUser.js";

export interface IMentor extends Document {
  _id: Types.ObjectId;
  mentorId: string;
  userId: string | UserInterface | Types.ObjectId ;
  isApproved?: string;
  rejectionReason?: string;
  skills?: string[];
  certifications?: string[];
  specialization?: string;
  bio: string;
  price: number;
  availableSlots?: object[];
  timePeriod?: number;
  createdAt: Date;
  updatedAt: Date;
}
