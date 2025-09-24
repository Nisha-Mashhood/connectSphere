import { Document, Types } from "mongoose";

export interface IReview extends Document {
  _id: Types.ObjectId;
  reviewId: string;
  userId: Types.ObjectId;
  rating: number;
  comment: string;
  isApproved: boolean;
  isSelect: boolean;
  createdAt: Date;
}
