import mongoose from "mongoose";
import { generateCustomId } from "../utils/idGenerator.utils.js";
// Category Schema
const categorySchema = new mongoose.Schema({
    categoryId: {
        type: String,
        unique: true,
    },
    name: {
        type: String,
        required: true,
        unique: true
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
// Pre-save hook to generate categoryId
categorySchema.pre("save", async function (next) {
    if (!this.categoryId) {
        this.categoryId = await generateCustomId("category", "CAT");
    }
    next();
});
export const Category = mongoose.model("Category", categorySchema);
//# sourceMappingURL=category.model.js.map