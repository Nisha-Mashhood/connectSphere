import mongoose, { Schema } from "mongoose";
import { generateCustomId } from "../utils/idGenerator.utils.js";
import { IReview } from "../Interfaces/models/IReview.js";
import logger from "../core/Utils/Logger.js";

const ReviewSchema: Schema<IReview> = new Schema({
  reviewId: {
    type: String,
    unique: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    required: true,
  },
  isApproved: {
    type: Boolean,
    default: false,
  },
  isSelect: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Pre-save hook to generate reviewId
ReviewSchema.pre("save", async function (next) {
  if (!this.reviewId) {
    try {
      this.reviewId = await generateCustomId("review", "RVW");
      logger.debug(
        `Generated reviewId: ${this.reviewId} for userId ${this.userId}`
      );
    } catch (error) {
      logger.error(
        `Error generating reviewId: ${this.reviewId} for userId ${this.userId} : ${error}`
      );
      return next(error as Error);
    }
  }
  next();
});

export default mongoose.model<IReview>("Review", ReviewSchema);
