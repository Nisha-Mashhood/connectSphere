import { Document, Types } from "mongoose";

export interface IFeedback extends Document {
  _id: Types.ObjectId;
  feedbackId: string;
  userId: Types.ObjectId;
  mentorId: Types.ObjectId;
  collaborationId: Types.ObjectId;
  givenBy: "user" | "mentor";
  rating: number;
  communication: number;
  expertise: number;
  punctuality: number;
  comments: string;
  wouldRecommend: boolean;
  isHidden: boolean;
  createdAt: Date;
}
