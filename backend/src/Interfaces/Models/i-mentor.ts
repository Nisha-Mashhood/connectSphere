import { Document, Types } from "mongoose";
import { IUser } from "./i-user";
import { ISkill } from "./i-skill";

export interface IMentor extends Document {
  _id: Types.ObjectId;
  mentorId: string;
  userId: Types.ObjectId | IUser;
  isApproved?: string;
  rejectionReason?: string;
  skills?: string[] | ISkill[];
  certifications?: string[];
  specialization?: string;
  bio: string;
  price: number;
  availableSlots?: object[];
  timePeriod?: number;
  createdAt: Date;
  updatedAt: Date;
}
