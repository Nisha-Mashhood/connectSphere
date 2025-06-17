import { Document, Types } from "mongoose";

export interface CategoryInterface extends Document {
  _id: Types.ObjectId;
  categoryId: string;
  name: string;
  description?: string;
  imageUrl?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
