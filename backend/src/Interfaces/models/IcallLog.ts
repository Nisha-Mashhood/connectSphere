import { Types } from "mongoose";
import { Document } from "mongoose";

export interface ICallLog extends Document {
  _id: Types.ObjectId;
  CallId: string;
  chatKey: string;
  callType: "audio" | "video";
  type: "group" | "user-mentor" | "user-user";
  senderId: string;
  recipientIds: string[];
  groupId?: string;
  status: "ongoing" | "completed" | "missed";
  callerName?: string; 
  startTime: Date;
  endTime?: Date;
  duration?: number;
  createdAt: Date;
  updatedAt: Date;
}