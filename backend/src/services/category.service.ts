import { CategoryInterface } from "src/models/category.model.js";
import * as CategoryRepo from "../repositories/category.repositry.js";
import { deleteManySubcategories } from "../repositories/subcategory.repositry.js";
import { deleteManySkills } from "../repositories/skills.repositry.js";
import { uploadImage } from "../utils/cloudinary.utils.js";

export const isDuplicateCategoryName = async (
  name: string,
  excludeId?: string
): Promise<boolean> => {
  return await CategoryRepo.isDuplicateCategoryName(name, excludeId);
};

// Create a new category with optional image upload
export const createCategory = async (
  data: Partial<CategoryInterface>,
  imagePath?: string
) => {
  let imageUrl = null;
  if (imagePath) {
    const folder = "categories";
    imageUrl = await uploadImage(imagePath, folder);
  }
  return await CategoryRepo.createCategory({ ...data, imageUrl });
};

export const getAllCategories = CategoryRepo.getAllCategories;
export const getCategoryById = CategoryRepo.getCategoryById;

export const updateCategory = async (
  id: string,
  data: Partial<CategoryInterface>,
  imagePath?: string
) => {
  let imageUrl = null;
  if (imagePath) {
    const folder = "categories";
    imageUrl = await uploadImage(imagePath, folder);
  }
  return await CategoryRepo.updateCategory(id, {
    ...data,
    ...(imageUrl && { imageUrl }),
  });
};

export const deleteCategory = async (id: string) => {
  try {
    // Delete related subcategories first
    await deleteManySubcategories(id);

    // Delete related skills
    await deleteManySkills(id);

    // Now delete the category itself
    return await CategoryRepo.deleteCategory(id);
  } catch (error: any) {
    throw new Error(
      `Error deleting category and related data: ${error.message}`
    );
  }
};
