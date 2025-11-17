import mongoose, { Schema } from "mongoose";
import { generateCustomId } from "../core/utils/id-generator";
import { IFeedback } from "../Interfaces/Models/i-feedback";
import logger from "../core/utils/logger";

const FeedbackSchema: Schema<IFeedback> = new Schema(
  {
    feedbackId: {
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
    isHidden: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Pre-save hook to generate feedbackId
FeedbackSchema.pre("save", async function (next) {
  if (!this.feedbackId) {
    try {
      this.feedbackId = await generateCustomId("feedback", "FDB");
      logger.debug(
        `Generated feedbackId: ${this.feedbackId} for userId ${this.userId}`
      );
    } catch (error) {
      logger.error(
        `Error generating feedbackId: ${this.feedbackId} for userId ${this.userId} : ${error}`
      );
      return next(error as Error);
    }
  }
  next();
});

export default mongoose.model<IFeedback>("Feedback", FeedbackSchema);
