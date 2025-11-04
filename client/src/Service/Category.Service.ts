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
export const fetchCategoriesService = async (params: {
  search?: string;
  page?: number;
  limit?: number;
} = {}) => {
  try {
    const { search, page = 1, limit = 10 } = params;
    const response = await axiosInstance.get("category/get-categories", {
      params: { search, page, limit },
    });
    const { categories, total } = response.data.data;
    return { items: categories, total };
  } catch (error) {
    handleError(error);
  }
};


export const getCategoriesService = async () => {
  try {
    const response = await axiosInstance.get("category/fetch-categories");
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
export const fetchSubCategoriesService = async (
  categoryId: string,
  params: { search?: string; page?: number; limit?: number } = {}
) => {
  try {
    const { search, page = 1, limit = 10 } = params;
    const response = await axiosInstance.get(
      `subcategory/get-subcategories/${categoryId}`,
      {
        params: { search, page, limit },
      }
    );
    const { subcategories, total } = response.data.data;
    return { items: subcategories, total };
  } catch (error) {
    handleError(error);
    throw error;
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
export const fetchSkillsService = async (
  subcategoryId: string,
  params: { search?: string; page?: number; limit?: number } = {}
) => {
  try {
    const { search, page = 1, limit = 10 } = params;
    const response = await axiosInstance.get(
      `skills/get-skills/${subcategoryId}`,
      {
        params: { search, page, limit },
      }
    );
    const { skills, total } = response.data.data;
    return { items: skills, total };
  } catch (error) {
    handleError(error);
    throw error;
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
