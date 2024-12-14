import { Subcategory, SubcategoryInterface } from "../models/subcategory.model.js";

// Create Subcategory
export const createSubcategory = async (data: Partial<SubcategoryInterface>) => {
  return await Subcategory.create(data);
};

// Get all subcategories
export const getAllSubcategories = async () => {
  return await Subcategory.find().populate("categoryId");
};

// Get a subcategory by ID
export const getSubcategoryById = async (id: string) => {
  return await Subcategory.findById(id).populate("categoryId");
};

// Update a subcategory
export const updateSubcategory = async (id: string, data: Partial<SubcategoryInterface>) => {
  return await Subcategory.findByIdAndUpdate(id, data, { new: true });
};

// Delete a subcategory
export const deleteSubcategory = async (id: string) => {
  return await Subcategory.findByIdAndDelete(id);
};
