import { IUser } from "./i-user.js";
import { Document, Types } from "mongoose";

export interface IUserConnection extends Document {
  _id: Types.ObjectId;
  connectionId: string;
  requester: string | IUser | Types.ObjectId;
  recipient: string | IUser | Types.ObjectId;
  requestStatus: "Pending" | "Accepted" | "Rejected";
  connectionStatus: "Connected" | "Disconnected";
  requestSentAt: Date;
  requestAcceptedAt?: Date;
  disconnectedAt?: Date;
  disconnectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}
