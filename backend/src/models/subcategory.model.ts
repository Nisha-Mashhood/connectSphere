import mongoose, { Schema, Document, Model } from "mongoose";
import { generateCustomId } from '../utils/idGenerator.utils.js';

export interface SubcategoryInterface extends Document {
    subcategoryId:string;
    name: string;
    categoryId: mongoose.Types.ObjectId;
    description?: string;
    imageUrl?:string | null;
    createdAt: Date;
    updatedAt: Date;
  }

  // Category Schema
const SubcategorySchema: Schema<SubcategoryInterface> = new mongoose.Schema(
    {
      subcategoryId: {
        type: String,
        unique: true,
        required: true
      },
      name: { 
        type: String, 
        required: true, 
        unique: true 
    },
    categoryId:{
        type:Schema.Types.ObjectId,
        ref: "Category",
        required:true

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

  // Pre-save hook to generate subcategoryId
  SubcategorySchema.pre("save", async function(next) {
      if (!this.subcategoryId) {
        this.subcategoryId = await generateCustomId("subcategory", "SUB");
      }
      next();
    });
  


  export const Subcategory: Model<SubcategoryInterface> = mongoose.model<SubcategoryInterface>("Subcategory", SubcategorySchema);

  