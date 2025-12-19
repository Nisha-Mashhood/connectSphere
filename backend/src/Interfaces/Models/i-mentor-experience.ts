import { Document } from "mongoose";
import { Types } from "mongoose";

export interface IMentorExperience extends Document{
  _id: Types.ObjectId;
  mentorExperienceId:string;
  mentorId: Types.ObjectId;
  role: string;
  organization: string;
  startDate: Date;
  endDate?: Date;
  isCurrent: boolean;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}