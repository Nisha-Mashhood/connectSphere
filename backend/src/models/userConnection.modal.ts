import mongoose, { Schema, Document } from "mongoose";
import { UserInterface } from "./user.model.js";

export interface IUserConnection extends Document {
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

const UserConnectionSchema: Schema = new Schema(
  {
    requester: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recipient: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    requestStatus: {
      type: String,
      enum: ["Pending", "Accepted", "Rejected"],
      default: "Pending",
    },
    connectionStatus: {
      type: String,
      enum: ["Connected", "Disconnected"],
      default: "Disconnected",
    },
    requestSentAt: {
      type: Date,
      default: Date.now,
    },
    requestAcceptedAt: {
      type: Date,
    },
    disconnectedAt: {
      type: Date,
    },
    disconnectionReason: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IUserConnection>("UserConnection", UserConnectionSchema);
