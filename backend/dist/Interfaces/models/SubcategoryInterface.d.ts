import { Document, Types } from "mongoose";
export interface SubcategoryInterface extends Document {
    _id: Types.ObjectId;
    subcategoryId: string;
    name: string;
    categoryId: Types.ObjectId;
    description?: string;
    imageUrl?: string | null;
    createdAt: Date;
    updatedAt: Date;
}
//# sourceMappingURL=SubcategoryInterface.d.ts.map