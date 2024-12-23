import * as CategoryRepo from "../repositories/category.repositry.js";
import { uploadImage } from "../utils/cloudinary.utils.js";
export const isDuplicateCategoryName = async (name, excludeId) => {
    return await CategoryRepo.isDuplicateCategoryName(name, excludeId);
};
// Create a new category with optional image upload
export const createCategory = async (data, imagePath) => {
    let imageUrl = null;
    if (imagePath) {
        const folder = "categories";
        imageUrl = await uploadImage(imagePath, folder);
    }
    return await CategoryRepo.createCategory({ ...data, imageUrl });
};
export const getAllCategories = CategoryRepo.getAllCategories;
export const getCategoryById = CategoryRepo.getCategoryById;
export const updateCategory = async (id, data, imagePath) => {
    let imageUrl = null;
    if (imagePath) {
        const folder = "categories";
        imageUrl = await uploadImage(imagePath, folder);
    }
    return await CategoryRepo.updateCategory(id, { ...data, ...(imageUrl && { imageUrl }) });
};
export const deleteCategory = CategoryRepo.deleteCategory;
//# sourceMappingURL=category.service.js.map