import mongoose, { Schema, Document } from "mongoose";
import { IMentor } from "./mentor.model.js";
import { UserInterface } from "./user.model.js";

export interface ICollaboration extends Document {
  mentorId: IMentor | string;
  userId: UserInterface | string;
  selectedSlot: object[];
  price: number;
  payment: boolean;
  isCancelled: boolean;
  startDate: Date;
  endDate?: Date;
  createdAt: Date;
}

const CollaborationSchema: Schema = new Schema(
  {
    mentorId: {
      type: Schema.Types.ObjectId,
      ref: "Mentor",
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    selectedSlot: [
      {
        day: { type: String },
        timeSlots: [{ type: String }],
      },
    ],
    payment: {
      type: Boolean,
      default: false,
    },
    isCancelled: {
      type: Boolean,
      fefault: false,
    },
    price: {
      type: Number,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    endDate: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model<ICollaboration>(
  "Collaboration",
  CollaborationSchema
);
