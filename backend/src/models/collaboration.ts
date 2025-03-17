import mongoose, { Schema, Document } from "mongoose";
import { IMentor } from "./mentor.model.js";
import { UserInterface } from "./user.model.js";

export interface ICollaboration extends Document {
  mentorId: IMentor | string;
  userId: UserInterface | string;
  selectedSlot: object[];
  unavailableDays: object[];
  temporarySlotChanges: object[];
  price: number;
  payment: boolean;
  isCancelled: boolean;
  startDate: Date;
  endDate?: Date;
  feedbackGiven: boolean;
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
    unavailableDays: [
      {
        datesAndReasons: [
          {
            date: { type: Date },
            reason: { type: String },
          },
        ],
        requestedBy: {
          type: String,
          enum: ["user", "mentor"],
        },
        requesterId: {
          type: Schema.Types.ObjectId,
        },
        isApproved: {
          type: String,
          enum: ["pending", "approved", "rejected"],
          default: "pending",
        },
        approvedById: {
          type: Schema.Types.ObjectId,
        },
      },
    ],
    temporarySlotChanges: [
      {
        datesAndNewSlots: [
          {
            date: { type: Date },
            newTimeSlots: [{ type: String }],
          },
        ],
        requestedBy: {
          type: String,
          enum: ["user", "mentor"],
        },
        requesterId: {
          type: Schema.Types.ObjectId,
        },
        isApproved: {
          type: String,
          enum: ["pending", "approved", "rejected"],
          default: "pending",
        },
        approvedById: {
          type: Schema.Types.ObjectId,
        },
      },
    ],
    payment: {
      type: Boolean,
      default: false,
    },
    isCancelled: {
      type: Boolean,
      default: false,
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
    feedbackGiven: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model<ICollaboration>(
  "Collaboration",
  CollaborationSchema
);


