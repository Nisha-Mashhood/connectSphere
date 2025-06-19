import mongoose from "mongoose";
import { generateCustomId } from "../core/Utils/IdGenerator.js";
import logger from "../core/Utils/Logger.js";
// Category Schema
const categorySchema = new mongoose.Schema({
    categoryId: {
        type: String,
        unique: true,
    },
    name: {
        type: String,
        required: true,
        unique: true,
    },
    description: {
        type: String,
        default: null,
    },
    imageUrl: {
        type: String,
        default: null,
    },
}, { timestamps: true });
// Pre-save hook to generate categoryId
categorySchema.pre("save", async function (next) {
    if (!this.categoryId) {
        try {
            this.categoryId = await generateCustomId("category", "CAT");
            logger.debug(`Generated categoryId: ${this.categoryId} for name ${this.name}`);
        }
        catch (error) {
            logger.error(`Error generating categoryId: ${this.categoryId} for name ${this.name} : ${error}`);
            return next(error);
        }
    }
    next();
});
export const Category = mongoose.model("Category", categorySchema);
//# sourceMappingURL=category.model.js.map