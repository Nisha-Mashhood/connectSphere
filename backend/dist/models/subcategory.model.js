import mongoose, { Schema } from "mongoose";
import { generateCustomId } from '../utils/idGenerator.utils.js';
// Category Schema
const SubcategorySchema = new mongoose.Schema({
    subcategoryId: {
        type: String,
        unique: true,
    },
    name: {
        type: String,
        required: true,
        unique: true
    },
    categoryId: {
        type: Schema.Types.ObjectId,
        ref: "Category",
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
// Pre-save hook to generate subcategoryId
SubcategorySchema.pre("save", async function (next) {
    if (!this.subcategoryId) {
        this.subcategoryId = await generateCustomId("subcategory", "SUB");
    }
    next();
});
export const Subcategory = mongoose.model("Subcategory", SubcategorySchema);
//# sourceMappingURL=subcategory.model.js.map