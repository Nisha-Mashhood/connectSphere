import mongoose, { Schema, Document } from "mongoose";

export interface ICounter extends Document {
  _id: string;  // Collection name (e.g., "user", "mentor")
  sequence: number;  // Last used number
}

const counterSchema: Schema<ICounter> = new Schema({
  _id: { type: String, required: true },
  sequence: { type: Number, default: 100 },  // Start at 100 for USR101, MTR101, etc.
});

export default mongoose.model<ICounter>("Counter", counterSchema);