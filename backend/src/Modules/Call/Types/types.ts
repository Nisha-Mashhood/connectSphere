import { Types } from "mongoose";

export interface ICallLogPopulated {
  _id: Types.ObjectId;
  CallId: string;
  chatKey: string;
  callType: "audio" | "video";
  type: "group" | "user-mentor" | "user-user";
  senderId: {
    _id: string | Types.ObjectId;
    name: string;
    profilePic: string | null;
  };
  recipientIds: {
    _id: string | Types.ObjectId;
    name: string;
    profilePic: string | null;
  }[];
  groupId?: string;
  status: "ongoing" | "completed" | "missed";
  callerName?: string; 
  startTime: Date;
  endTime?: Date;
  duration?: number;
  createdAt: Date;
  updatedAt: Date;
}