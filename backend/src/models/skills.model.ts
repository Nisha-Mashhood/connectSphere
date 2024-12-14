import mongoose, { Schema, Document, Model } from "mongoose";

export interface SkillInterface extends Document {
    name: string;
    categoryId: mongoose.Types.ObjectId;
    subcategoryId: mongoose.Types.ObjectId;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
  }
// Skill Schema
const skillSchema: Schema<SkillInterface> = new Schema(
    {
      name: { 
        type: String, 
        required: true 
    },
      categoryId: { 
        type: Schema.Types.ObjectId, 
        ref: "Category", 
        required: true 
    },
      subcategoryId: { 
        type: Schema.Types.ObjectId, 
        ref: "Subcategory", 
        required: true 
    },
      description: { 
        type: String, 
        default: null 
    },
    },
    { timestamps: true }
  );
  
export const Skill: Model<SkillInterface> = mongoose.model<SkillInterface>("Skill", skillSchema);