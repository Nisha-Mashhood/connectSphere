import { Document } from "mongoose";

export interface ICounter extends Document {
  _id: string; // Collection name (e.g., "user", "mentor")
  sequence: number; // Last used number
}
