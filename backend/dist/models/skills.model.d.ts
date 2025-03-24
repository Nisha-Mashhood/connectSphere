import mongoose, { Document, Model } from "mongoose";
export interface SkillInterface extends Document {
    skillId: string;
    name: string;
    categoryId: mongoose.Types.ObjectId;
    subcategoryId: mongoose.Types.ObjectId;
    description?: string;
    imageUrl?: string | null;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Skill: Model<SkillInterface>;
//# sourceMappingURL=skills.model.d.ts.map