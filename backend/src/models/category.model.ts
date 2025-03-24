import mongoose, { Schema, Document, Model } from "mongoose";
import { generateCustomId } from "../utils/idGenerator.utils.js";

export interface CategoryInterface extends Document {
    categoryId: string;
    name: string;
    description?: string;
    imageUrl?:string | null;
    createdAt: Date;
    updatedAt: Date;
  }

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
        unique: true 
    },
      description: { 
        type: String, 
        default: null 
    },
    imageUrl: { 
      type: String, 
      default: null 
    },
    },
    { timestamps: true }
  );

  // Pre-save hook to generate categoryId
  categorySchema.pre("save", async function(next) {
      if (!this.categoryId) {
        this.categoryId = await generateCustomId("category", "CAT");
      }
      next();
    });

 export  const Category: Model<CategoryInterface> = mongoose.model<CategoryInterface>("Category", categorySchema);