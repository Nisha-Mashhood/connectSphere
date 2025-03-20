import mongoose, { Schema } from "mongoose";
// Category Schema
const SubcategorySchema = new mongoose.Schema({
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
export const Subcategory = mongoose.model("Subcategory", SubcategorySchema);
//# sourceMappingURL=subcategory.model.js.map