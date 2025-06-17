import mongoose, { Schema, Model } from "mongoose";
import { generateCustomId } from "../utils/idGenerator.utils.js";
import { CategoryInterface } from "../Interfaces/models/CategoryInterface.js";
import logger from "../core/Utils/Logger.js";

// Category Schema
const categorySchema: Schema<CategoryInterface> = new mongoose.Schema(
  {
    categoryId: {
      type: String,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      unique: true,
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

// Pre-save hook to generate categoryId
categorySchema.pre("save", async function (next) {
  if (!this.categoryId) {
    try {
      this.categoryId = await generateCustomId("category", "CAT");
      logger.debug(
        `Generated categoryId: ${this.categoryId} for name ${this.name}`
      );
    } catch (error) {
      logger.error(
        `Error generating categoryId: ${this.categoryId} for name ${this.name} : ${error}`
      );
      return next(error as Error);
    }
  }
  next();
});

export const Category: Model<CategoryInterface> =
  mongoose.model<CategoryInterface>("Category", categorySchema);
