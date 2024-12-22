import mongoose from "mongoose";
// Category Schema
const categorySchema = new mongoose.Schema({
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
export const Category = mongoose.model("Category", categorySchema);
//# sourceMappingURL=category.model.js.map