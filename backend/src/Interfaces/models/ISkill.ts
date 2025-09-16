import { Document, Types } from "mongoose";

export interface ISkill extends Document {
  _id: Types.ObjectId;
  skillId: string;
  name: string;
  categoryId: Types.ObjectId;
  subcategoryId: Types.ObjectId;
  description?: string;
  imageUrl?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
