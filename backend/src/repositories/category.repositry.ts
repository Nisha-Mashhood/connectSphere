import { Category, CategoryInterface } from "../models/category.model.js";

// Create Category
export const createCategory = async (data: Partial<CategoryInterface>) => {
  return await Category.create(data);
};

// Get all categories
export const getAllCategories = async () => {
  return await Category.find();
};

// Get a category by ID
export const getCategoryById = async (id: string) => {
  return await Category.findById(id);
};

// Update a category
export const updateCategory = async (id: string, data: Partial<CategoryInterface>) => {
  return await Category.findByIdAndUpdate(id, data, { new: true });
};

// Delete a category
export const deleteCategory = async (id: string) => {
  return await Category.findByIdAndDelete(id);
};


