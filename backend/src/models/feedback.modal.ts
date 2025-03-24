import mongoose, { Schema, Document } from 'mongoose';
import { generateCustomId } from '../utils/idGenerator.utils.js';

export interface IFeedback extends Document {
  feedbackId: string;
  userId: mongoose.Types.ObjectId;
  mentorId: mongoose.Types.ObjectId;
  collaborationId: mongoose.Types.ObjectId;
  givenBy: "user" | "mentor"; 
  rating: number;
  communication: number;
  expertise: number;
  punctuality: number;
  comments: string;
  wouldRecommend: boolean;
  createdAt: Date;
}

const FeedbackSchema: Schema = new Schema(
  {
    feedbackId:{
      type: String,
      unique: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    mentorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Mentor",
      required: true,
    },
    collaborationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Collaboration",
      required: true,
    },
    givenBy: {
      type: String,
      enum: ["user", "mentor"], 
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    communication: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    expertise: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    punctuality: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comments: {
      type: String,
      required: true,
      minlength: 5,
      maxlength: 500,
    },
    wouldRecommend: {
      type: Boolean,
      required: true,
    },
  },
  { timestamps: true }
);

// Pre-save hook to generate feedbackId
  FeedbackSchema.pre("save", async function(next) {
      if (!this.feedbackId) {
        this.feedbackId = await generateCustomId("feedback", "FDB");
      }
      next();
    });

export default mongoose.model<IFeedback>("Feedback", FeedbackSchema);