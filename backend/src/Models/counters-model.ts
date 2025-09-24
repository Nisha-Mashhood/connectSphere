import mongoose, { Schema } from "mongoose";
import { ICounter } from "../Interfaces/Models/i-counter";

const counterSchema: Schema<ICounter> = new Schema({
  _id: { type: String, required: true },
  sequence: { type: Number, default: 100 },  // Start at 100 for USR101, MTR101, etc.
});

export default mongoose.model<ICounter>("Counter", counterSchema);