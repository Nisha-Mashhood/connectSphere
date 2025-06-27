import mongoose, { Schema, Model } from "mongoose";
import { generateCustomId } from "../core/Utils/IdGenerator";
import { SkillInterface } from "../Interfaces/models/SkillInterface";
import logger from "../core/Utils/Logger";

// Skill Schema
const skillSchema: Schema<SkillInterface> = new Schema(
  {
    skillId: {
      type: String,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    subcategoryId: {
      type: Schema.Types.ObjectId,
      ref: "Subcategory",
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

// Pre-save hook to generate skillId
skillSchema.pre("save", async function (next) {
  if (!this.skillId) {
    try {
      this.skillId = await generateCustomId("skill", "SKL");
      logger.debug(
        `Generated skillId: ${this.skillId} for name ${this.name} and categoryId: ${this.categoryId}`
      );
    } catch (error) {
      logger.error(
        `Error generating skillId: ${this.skillId} for name ${this.name} and categoryId: ${this.categoryId}: ${error}`
      );
      return next(error as Error);
    }
  }
  next();
});

export const Skill: Model<SkillInterface> = mongoose.model<SkillInterface>(
  "Skill",
  skillSchema
);
