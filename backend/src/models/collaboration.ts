import mongoose, { Schema, Document } from "mongoose";
import { IMentor } from "./mentor.model.js";
import { UserInterface } from "./user.model.js";
import { generateCustomId } from "../utils/idGenerator.utils.js";

export interface ICollaboration extends Document {
  collaborationId:string;
  mentorId: IMentor | string;
  userId: UserInterface | string;
  selectedSlot: {
    day: | "Sunday"| "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday";
    timeSlots: string[];
  }[];
  unavailableDays: {
    _id: mongoose.Types.ObjectId;
    datesAndReasons: { date: Date; reason: string }[];
    requestedBy: "user" | "mentor";
    requesterId: mongoose.Types.ObjectId;
    isApproved: "pending" | "approved" | "rejected";
    approvedById: mongoose.Types.ObjectId;
  }[];
  temporarySlotChanges: {
    _id: mongoose.Types.ObjectId;
    datesAndNewSlots: { date: Date; newTimeSlots: string[] }[];
    requestedBy: "user" | "mentor";
    requesterId: mongoose.Types.ObjectId;
    isApproved: "pending" | "approved" | "rejected";
    approvedById: mongoose.Types.ObjectId;
  }[];
  price: number;
  payment: boolean;
  isCancelled: boolean;
  startDate: Date;
  endDate?: Date;
  feedbackGiven: boolean;
  createdAt: Date;
}

// Schema remains the same, just ensure it matches the interface
const CollaborationSchema: Schema = new Schema(
  {
    collaborationId: {
      type: String, 
      unique: true, 
      required: true
    },
    mentorId: { 
      type: Schema.Types.ObjectId, 
      ref: "Mentor", 
      required: true 
    },
    userId: { 
      type: Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    selectedSlot: [
      {
        day: {
          type: String,
          enum: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",],
        },
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
          enum: ["user", "mentor"] 
        },
        requesterId: { 
          type: Schema.Types.ObjectId 
        },
        isApproved: {
          type: String,
          enum: ["pending", "approved", "rejected"],
          default: "pending",
        },
        approvedById: { type: Schema.Types.ObjectId },
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
          enum: ["user", "mentor"] 
        },
        requesterId: { 
          type: Schema.Types.ObjectId 
        },
        isApproved: {
          type: String,
          enum: ["pending", "approved", "rejected"],
          default: "pending",
        },
        approvedById: { type: Schema.Types.ObjectId },
      },
    ],
    payment: { 
      type: Boolean, 
      default: false 
    },
    isCancelled: { 
      type: Boolean, 
      default: false 
    },
    price: { 
      type: Number, 
      required: true 
    },
    startDate: { 
      type: Date, 
      required: true, 
      default: Date.now 
    },
    endDate: { 
      type: Date, 
      default: null 
    },
    feedbackGiven: { 
      type: Boolean, 
      default: false 
    },
  },
  { timestamps: true }
);


// Pre-save hook to generate collaborationId
  CollaborationSchema.pre("save", async function(next) {
      if (!this.collaborationId) {
        this.collaborationId = await generateCustomId("collaboration", "COL");
      }
      next();
    });

export default mongoose.model<ICollaboration>(
  "Collaboration",
  CollaborationSchema
);
