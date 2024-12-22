import { CategoryInterface } from "src/models/category.model.js";
import * as CategoryRepo from "../repositories/category.repositry.js";
import { uploadImage } from "../utils/cloudinary.utils.js";

// Create a new category with optional image upload
export const createCategory = async (data: Partial<CategoryInterface>, imagePath?: string) => {
    let imageUrl = null;
    if (imagePath) {
      const folder = "categories";
      imageUrl = await uploadImage(imagePath, folder);
    }
    return await CategoryRepo.createCategory({ ...data, imageUrl });
  };

export const getAllCategories = CategoryRepo.getAllCategories;
export const getCategoryById = CategoryRepo.getCategoryById;

export const updateCategory = async (id: string, data: Partial<CategoryInterface>, imagePath?: string) => {
    let imageUrl = null;
    if (imagePath) {
      const folder = "categories";
      imageUrl = await uploadImage(imagePath, folder);
    }
    return await CategoryRepo.updateCategory(id, { ...data, ...(imageUrl && { imageUrl }) });
  };
  
export const deleteCategory = CategoryRepo.deleteCategory;

