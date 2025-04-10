import { Document, Model } from "mongoose";
export interface CategoryInterface extends Document {
    categoryId: string;
    name: string;
    description?: string;
    imageUrl?: string | null;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Category: Model<CategoryInterface>;
//# sourceMappingURL=category.model.d.ts.map