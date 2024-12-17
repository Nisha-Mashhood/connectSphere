import mongoose, { Schema } from "mongoose";
// Skill Schema
const skillSchema = new Schema({
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
}, { timestamps: true });
export const Skill = mongoose.model("Skill", skillSchema);
//# sourceMappingURL=skills.model.js.map