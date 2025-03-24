import mongoose, { Schema } from "mongoose";
import { generateCustomId } from '../utils/idGenerator.utils.js';
// Skill Schema
const skillSchema = new Schema({
    skillId: {
        type: String,
        unique: true,
    },
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
    imageUrl: {
        type: String,
        default: null
    },
}, { timestamps: true });
// Pre-save hook to generate skillId
skillSchema.pre("save", async function (next) {
    if (!this.skillId) {
        this.skillId = await generateCustomId("skill", "SKL");
    }
    next();
});
export const Skill = mongoose.model("Skill", skillSchema);
//# sourceMappingURL=skills.model.js.map