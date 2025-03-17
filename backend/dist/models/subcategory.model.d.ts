import mongoose, { Document, Model } from "mongoose";
export interface SubcategoryInterface extends Document {
    name: string;
    categoryId: mongoose.Types.ObjectId;
    description?: string;
    imageUrl?: string | null;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Subcategory: Model<SubcategoryInterface>;
//# sourceMappingURL=subcategory.model.d.ts.map