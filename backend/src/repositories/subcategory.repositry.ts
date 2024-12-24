import { Subcategory, SubcategoryInterface } from "../models/subcategory.model.js";

// Create Subcategory
export const createSubcategory = async (data: Partial<SubcategoryInterface>) => {
  return await Subcategory.create(data);
};

// Get all subcategories
export const getAllSubcategories = async (categoryId:string) => {
  return await Subcategory.find({ categoryId }).populate("categoryId");
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

// Delete many subcategories by categoryId
export const deleteManySubcategories = async (categoryId:string) => {
  try {
    const result = await Subcategory.deleteMany({ categoryId });
    return result;
  } catch (error:any) {
    throw new Error(`Error deleting subcategories: ${error.message}`);
  }
};
