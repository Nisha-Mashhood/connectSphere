import { Schema, model } from "mongoose";
import { generateCustomId } from "../utils/idGenerator.utils.js";
import { Call } from "../Interfaces/models/Call.js";

const CallSchema = new Schema<Call>({
  CallId: {
    type: String,
    unique: true,
  },
  chatKey: {
    type: String,
    required: true,
    index: true,
  },
  callerId: {
    type: String,
    required: true,
  },
  recipientId: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["audio", "video"],
    required: true,
  },
  status: {
    type: String,
    enum: ["incoming", "answered", "missed"],
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

CallSchema.index({ chatKey: 1, timestamp: -1 });

// Pre-save hook to generate CallId
CallSchema.pre("save", async function (next) {
  if (!this.CallId) {
    this.CallId = await generateCustomId("call", "CAL");
  }
  next();
});

export const CallModel = model<Call>("Call", CallSchema);
