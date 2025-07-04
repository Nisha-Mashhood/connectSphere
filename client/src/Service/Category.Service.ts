import { axiosInstance } from "../lib/axios";
import { handleError } from "./ErrorHandler";

export const createCategory = async (formData) => {
  try {
    const response = await axiosInstance.post(
      "category/create-category",
      formData
    );
    return response.data.data;
  } catch (error) {
    handleError(error);
    throw error;
  }
};

export const createSubCategory = async (formData) => {
  try {
    const response = await axiosInstance.post(
      "subcategory/create-subcategory",
      formData
    );
    return response.data.data;
  } catch (error) {
    handleError(error);
  }
};

export const createSkill = async (formData) => {
  try {
    const response = await axiosInstance.post("skills/create-skill", formData);
    return response.data.data;
  } catch (error) {
    handleError(error);
  }
};

//Fetch categories
export const fetchCategoriesService = async () => {
  try {
    const response = await axiosInstance.get("category/get-categories");
    return response.data.data;
  } catch (error) {
    handleError(error);
  }
};

// Update category
export const updateCategory = async (editingCategoryId: string, formData) => {
  try {
    const response = await axiosInstance.put(
      `category/update-category/${editingCategoryId}`,
      formData
    );
    return response.data.data;
  } catch (error) {
    handleError(error);
  }
};

// Delete category
export const deleteCategory = async (id: string) => {
  try {
    const response = await axiosInstance.delete(
      `category/delete-category/${id}`
    );
    return response.data.data;
  } catch (error) {
    handleError(error);
  }
};

// Fetch subcategories
export const fetchSubCategoriesService = async (categoryId: string) => {
  try {
    const response = await axiosInstance.get(
      `subcategory/get-subcategories/${categoryId}`
    );
    return response.data.data;
  } catch (error) {
    handleError(error);
  }
};

// Update subcategory
export const updateSubCategory = async (
  editingSubCategoryId: string,
  formData
) => {
  try {
    const response = await axiosInstance.put(
      `subcategory/update-subcategory/${editingSubCategoryId}`,
      formData
    );
    return response.data.data;
  } catch (error) {
    handleError(error);
  }
};

// Delete subcategory
export const deleteSubCategory = async (id: string) => {
  try {
    const response = await axiosInstance.delete(
      `subcategory/delete-subcategory/${id}`
    );
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

// Fetch skills
export const fetchSkillsService = async (subcategoryId: string) => {
  try {
    const response = await axiosInstance.get(
      `skills/get-skills/${subcategoryId}`
    );
    return response.data.data;
  } catch (error) {
    handleError(error);
  }
};

// Update skill
export const updateSkill = async (editingSkillId: string, formData) => {
  try {
    const response = await axiosInstance.put(
      `skills/update-skill/${editingSkillId}`,
      formData
    );
    return response.data.data;
  } catch (error) {
    handleError(error);
  }
};

// Delete skill
export const deleteSkill = async (id: string) => {
  try {
    const response = await axiosInstance.delete(`skills/delete-skill/${id}`);
    return response.data.data;
  } catch (error) {
    handleError(error);
  }
};

// Get all skills
export const getAllSkills = async () => {
  try {
    const response = await axiosInstance.get(`/skills/get-allSkills`);
    return response.data.data;
  } catch (error) {
    handleError(error);
  }
};
