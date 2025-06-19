import mongoose, { Schema } from "mongoose";
import { generateCustomId } from "../core/Utils/IdGenerator.js";
import { ICollaboration } from "../Interfaces/models/ICollaboration.js";
import logger from "../core/Utils/Logger.js";

// Schema remains the same, just ensure it matches the interface
const CollaborationSchema: Schema<ICollaboration> = new Schema(
  {
    collaborationId: {
      type: String,
      unique: true,
    },
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
        day: {
          type: String,
          enum: [
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
          ],
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
        approvedById: { type: Schema.Types.ObjectId },
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

// Pre-save hook to generate collaborationId
CollaborationSchema.pre("save", async function (next) {
  if (!this.collaborationId) {
    try {
      this.collaborationId = await generateCustomId("collaboration", "COL");
      logger.debug(
        `Generated collaborationId: ${this.collaborationId} for mentorId ${this.mentorId} and userId ${this.userId}`
      );
    } catch (error) {
      logger.error(
        `Error generating collaborationId: ${this.collaborationId} for mentorId ${this.mentorId} and userId ${this.userId} : ${error}`
      );
      return next(error as Error);
    }
  }
  next();
});

export default mongoose.model<ICollaboration>(
  "Collaboration",
  CollaborationSchema
);
