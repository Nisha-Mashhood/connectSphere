import { Document, Model } from "mongoose";
export interface CategoryInterface extends Document {
    name: string;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Category: Model<CategoryInterface>;
//# sourceMappingURL=category.model.d.ts.map