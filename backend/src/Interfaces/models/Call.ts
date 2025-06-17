import { Document, Types } from "mongoose";

export interface Call extends Document {
  _id: Types.ObjectId;
  CallId: string;
  chatKey: string; // e.g., user-user_<userConnectionId>, user-mentor_<collaborationId>
  callerId: string;
  recipientId: string;
  type: "audio" | "video";
  status: "incoming" | "answered" | "missed";
  timestamp: Date;
}
