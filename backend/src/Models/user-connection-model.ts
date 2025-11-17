import mongoose, { Schema } from "mongoose";
import { generateCustomId } from "../core/utils/id-generator";
import { IUserConnection } from "../Interfaces/Models/i-user-connection";
import logger from "../core/utils/logger";

const UserConnectionSchema: Schema = new Schema(
  {
    connectionId: {
      type: String,
      unique: true,
    },
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

// Pre-save hook to generate connectionId
UserConnectionSchema.pre("save", async function (next) {
  if (!this.connectionId) {
    try {
      this.connectionId = await generateCustomId("userConnection", "UCN");
      logger.debug(
        `Generated connectionId: ${this.connectionId} for requester ${this.requester} and recipient: ${this.recipient}`
      );
    } catch (error) {
      logger.error(
        `Error generating connectionId for requester: ${this.requester} and recipient: ${this.recipient}: ${error}`
      );
      return next(error as Error);
    }
  }
  next();
});

export default mongoose.model<IUserConnection>(
  "UserConnection",
  UserConnectionSchema
);
