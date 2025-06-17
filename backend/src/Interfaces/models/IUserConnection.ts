import { UserInterface } from "./IUser.js";
import { Document, Types } from "mongoose";

export interface IUserConnection extends Document {
  _id: Types.ObjectId;
  connectionId: string;
  requester: string | UserInterface;
  recipient: string | UserInterface;
  requestStatus: "Pending" | "Accepted" | "Rejected";
  connectionStatus: "Connected" | "Disconnected";
  requestSentAt: Date;
  requestAcceptedAt?: Date;
  disconnectedAt?: Date;
  disconnectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}
