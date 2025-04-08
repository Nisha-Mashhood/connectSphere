import * as SubcategoryRepo from "../repositories/subcategory.repositry.js";
import { deleteManySkillsbySubcategoryId } from '../repositories/skills.repositry.js';
import { uploadMedia } from "../utils/cloudinary.utils.js";
export const createSubcategory = async (data, imagePath, fileSize) => {
    let imageUrl = null;
    if (imagePath) {
        const folder = "sub-categories";
        const { url } = await uploadMedia(imagePath, folder, fileSize);
        imageUrl = url;
    }
    return await SubcategoryRepo.createSubcategory({ ...data, imageUrl });
};
export const getAllSubcategories = async (categoryId) => {
    return await SubcategoryRepo.getAllSubcategories(categoryId);
};
export const getSubcategoryById = SubcategoryRepo.getSubcategoryById;
export const updateSubcategory = async (id, data, imagePath, fileSize) => {
    let imageUrl = null;
    if (imagePath) {
        const folder = "sub-categories";
        const { url } = await uploadMedia(imagePath, folder, fileSize);
        imageUrl = url;
    }
    return await SubcategoryRepo.updateSubcategory(id, { ...data, ...(imageUrl && { imageUrl }) });
};
export const deleteSubcategory = SubcategoryRepo.deleteSubcategory;
export const deleteCategory = async (id) => {
    try {
        // Delete related skills
        await deleteManySkillsbySubcategoryId(id);
        // Now delete the category itself
        return await SubcategoryRepo.deleteSubcategory(id);
    }
    catch (error) {
        throw new Error(`Error deleting category and related data: ${error.message}`);
    }
};
//# sourceMappingURL=subcategory.service.js.map