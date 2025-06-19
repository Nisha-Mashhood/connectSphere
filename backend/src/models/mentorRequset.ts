import mongoose, { Schema } from "mongoose";
import { generateCustomId } from "../core/Utils/IdGenerator.js";
import { IMentorRequest } from "src/Interfaces/models/IMentorRequest.js";
import logger from "../core/Utils/Logger.js";

const MentorRequestSchema: Schema<IMentorRequest> = new Schema(
  {
    mentorRequestId: {
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
    selectedSlot: {
      day: { type: String },
      timeSlots: { type: String },
    },
    price: {
      type: Number,
      required: true,
    },
    timePeriod: {
      type: Number,
      required: true,
      default: 30,
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed"],
      default: "Pending",
    },
    isAccepted: {
      type: String,
      enum: ["Pending", "Accepted", "Rejected"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

// Pre-save hook to generate mentorRequestId
MentorRequestSchema.pre("save", async function (next) {
  if (!this.mentorRequestId) {
    try {
      this.mentorRequestId = await generateCustomId("mentorRequest", "MRQ");
      logger.debug(
        `Generated mentorRequestId: ${this.mentorRequestId} for mentorId ${this.mentorId}`
      );
    } catch (error) {
      logger.error(
        `Error generating mentorRequestId: ${this.mentorRequestId} for mentorId ${this.mentorId} : ${error}`
      );
      return next(error as Error);
    }
  }
  next();
});

export default mongoose.model<IMentorRequest>(
  "MentorRequest",
  MentorRequestSchema
);
