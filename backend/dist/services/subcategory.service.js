import * as SubcategoryRepo from "../repositories/subcategory.repositry.js";
import { uploadImage } from "../utils/cloudinary.utils.js";
export const createSubcategory = async (data, imagePath) => {
    let imageUrl = null;
    if (imagePath) {
        const folder = "sub-categories";
        imageUrl = await uploadImage(imagePath, folder);
    }
    return await SubcategoryRepo.createSubcategory({ ...data, imageUrl });
};
export const getAllSubcategories = async (categoryId) => {
    return await SubcategoryRepo.getAllSubcategories(categoryId);
};
export const getSubcategoryById = SubcategoryRepo.getSubcategoryById;
export const updateSubcategory = async (id, data, imagePath) => {
    let imageUrl = null;
    if (imagePath) {
        const folder = "sub-categories";
        imageUrl = await uploadImage(imagePath, folder);
    }
    return await SubcategoryRepo.updateSubcategory(id, { ...data, ...(imageUrl && { imageUrl }) });
};
export const deleteSubcategory = SubcategoryRepo.deleteSubcategory;
//# sourceMappingURL=subcategory.service.js.map