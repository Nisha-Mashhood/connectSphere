import mongoose, { Schema, Model } from "mongoose";
import { generateCustomId } from "../utils/idGenerator.utils.js";
import { SubcategoryInterface } from "../Interfaces/models/SubcategoryInterface.js";
import logger from "../core/Utils/Logger.js";

// Category Schema
const SubcategorySchema: Schema<SubcategoryInterface> = new mongoose.Schema(
  {
    subcategoryId: {
      type: String,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      unique: true,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    description: {
      type: String,
      default: null,
    },
    imageUrl: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

// Pre-save hook to generate subcategoryId
SubcategorySchema.pre("save", async function (next) {
  if (!this.subcategoryId) {
    try {
      this.subcategoryId = await generateCustomId("subcategory", "SUB");
      logger.debug(
        `Generated subcategoryId: ${this.subcategoryId} for name ${this.name} and categoryId: ${this.categoryId}`
      );
    } catch (error) {
      logger.error(
        `Error generating subcategoryId: ${this.subcategoryId} for name ${this.name} and categoryId: ${this.categoryId}: ${error}`
      );
      return next(error as Error);
    }
  }
  next();
});

export const Subcategory: Model<SubcategoryInterface> =
  mongoose.model<SubcategoryInterface>("Subcategory", SubcategorySchema);
