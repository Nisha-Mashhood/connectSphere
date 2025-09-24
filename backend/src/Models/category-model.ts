import mongoose, { Schema, Model } from "mongoose";
import { generateCustomId } from "../core/Utils/id-generator";
import { ICategory } from "../Interfaces/Models/i-category";
import logger from "../core/Utils/logger";

const categorySchema: Schema<ICategory> = new mongoose.Schema(
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
    imageId: {
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

export const Category: Model<ICategory> =
  mongoose.model<ICategory>("Category", categorySchema);
