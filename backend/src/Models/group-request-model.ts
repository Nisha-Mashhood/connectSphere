import mongoose, { Schema } from "mongoose";
import { generateCustomId } from "../core/utils/id-generator";
import { IGroupRequest } from "../Interfaces/Models/i-group-request";
import logger from "../core/utils/logger";

const GroupRequestSchema: Schema = new Schema<IGroupRequest>(
  {
    groupRequestId: {
      type: String,
      unique: true,
    },
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Accepted", "Rejected"],
      default: "Pending",
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Completed", "Failed"],
      default: "Pending",
    },
    paymentId: {
      type: String,
      default: null, // Optional: can be filled after successful payment
    },
    amountPaid: {
      type: Number,
      default: 0, // Default 0 for groups without payment
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Pre-save hook to generate groupRequestId
GroupRequestSchema.pre("save", async function (next) {
  if (!this.groupRequestId) {
    try {
      this.groupRequestId = await generateCustomId("groupRequest", "GRQ");
      logger.debug(
        `Generated groupRequestId: ${this.groupRequestId} for groupId ${this.groupId}`
      );
    } catch (error) {
      logger.error(
        `Error generating groupRequestId: ${this.groupRequestId} for groupId ${this.groupId} : ${error}`
      );
      return next(error as Error);
    }
  }
  next();
});

const GroupRequest = mongoose.model<IGroupRequest>(
  "GroupRequest",
  GroupRequestSchema
);

export default GroupRequest;
