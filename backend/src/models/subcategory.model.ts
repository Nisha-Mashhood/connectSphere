import mongoose, { Schema, Document, Model } from "mongoose";

export interface SubcategoryInterface extends Document {
    name: string;
    categoryId: mongoose.Types.ObjectId;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
  }

  // Category Schema
const categorySchema: Schema<SubcategoryInterface> = new mongoose.Schema(
    {
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
    },
    { timestamps: true }
  );

  const Category: Model<SubcategoryInterface> = mongoose.model<SubcategoryInterface>("Category", categorySchema);

  export default Category