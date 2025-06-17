import mongoose, { Schema } from "mongoose";
import { generateCustomId } from "../utils/idGenerator.utils.js";
import { IReview } from "../Interfaces/models/IReview.js";



const ReviewSchema: Schema<IReview> = new Schema({
  reviewId: { 
    type: String, 
    unique: true,
},
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
},
  rating: { 
    type: Number, 
    required: true, 
    min: 1, 
    max: 5 
},
  comment: { 
    type: String, 
    required: true 
},
  isApproved: { 
    type: Boolean, 
    default: false 
},
  isSelect: { 
    type: Boolean, 
    default: false 
},
  createdAt: { 
    type: Date, 
    default: Date.now 
},
});

// Pre-save hook to generate reviewId
ReviewSchema.pre("save", async function (next) {
  if (!this.reviewId) {
    this.reviewId = await generateCustomId("review", "RVW");
  }
  next();
});

export default mongoose.model<IReview>("Review", ReviewSchema);
