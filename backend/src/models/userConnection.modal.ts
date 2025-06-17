import mongoose, { Schema } from "mongoose";
import { generateCustomId } from "../utils/idGenerator.utils.js";
import { IUserConnection } from "../Interfaces/models/IUserConnection.js";



const UserConnectionSchema: Schema = new Schema(
  {
    connectionId:{
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
UserConnectionSchema.pre("save", async function(next) {
    if (!this.connectionId) {
      this.connectionId = await generateCustomId("userConnection", "UCN");
    }
    next();
  });


export default mongoose.model<IUserConnection>("UserConnection", UserConnectionSchema);
