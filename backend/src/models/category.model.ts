import mongoose, { Schema, Document, Model } from "mongoose";

export interface CategoryInterface extends Document {
    name: string;
    description?: string;
    imageUrl?:string | null;
    createdAt: Date;
    updatedAt: Date;
  }

  // Category Schema
const categorySchema: Schema<CategoryInterface> = new mongoose.Schema(
    {
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

 export  const Category: Model<CategoryInterface> = mongoose.model<CategoryInterface>("Category", categorySchema);