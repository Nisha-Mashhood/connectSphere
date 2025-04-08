import * as CategoryRepo from "../repositories/category.repositry.js";
import { deleteManySubcategories } from "../repositories/subcategory.repositry.js";
import { deleteManySkills } from "../repositories/skills.repositry.js";
import { uploadMedia } from "../utils/cloudinary.utils.js";
export const isDuplicateCategoryName = async (name, excludeId) => {
    return await CategoryRepo.isDuplicateCategoryName(name, excludeId);
};
// Create a new category with optional image upload
export const createCategory = async (data, imagePath, fileSize) => {
    let imageUrl = null;
    if (imagePath) {
        const folder = "categories";
        const { url } = await uploadMedia(imagePath, folder, fileSize);
        imageUrl = url;
    }
    return await CategoryRepo.createCategory({ ...data, imageUrl });
};
export const getAllCategories = CategoryRepo.getAllCategories;
export const getCategoryById = CategoryRepo.getCategoryById;
export const updateCategory = async (id, data, imagePath, fileSize) => {
    let imageUrl = null;
    if (imagePath) {
        const folder = "categories";
        const { url } = await uploadMedia(imagePath, folder, fileSize);
        imageUrl = url;
    }
    return await CategoryRepo.updateCategory(id, {
        ...data,
        ...(imageUrl && { imageUrl }),
    });
};
export const deleteCategory = async (id) => {
    try {
        // Delete related subcategories first
        await deleteManySubcategories(id);
        // Delete related skills
        await deleteManySkills(id);
        // Now delete the category itself
        return await CategoryRepo.deleteCategory(id);
    }
    catch (error) {
        throw new Error(`Error deleting category and related data: ${error.message}`);
    }
};
//# sourceMappingURL=category.service.js.map