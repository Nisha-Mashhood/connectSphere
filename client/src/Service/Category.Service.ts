import { axiosInstance } from "../lib/axios";
import { handleError } from "./ErrorHandler";

export const createCategory = async (formData) => {
    try {
        await axiosInstance.post("admin/category/create-category",formData);
    } catch (error) {
      handleError(error)
    }
  };

  export const createSubCategory = async (formData) => {
    try {
         await axiosInstance.post("admin/subcategory/create-subcategory", formData);
    } catch (error) {
      handleError(error) 
    }
  };

  export const createSkill = async (formData) => {
    try {
        await axiosInstance.post("admin/skills/create-skill", formData);
    } catch (error) {
      handleError(error) 
    }
  };

  //Fetch categories
  export const fetchCategoriesService = async (): Promise<any[]> => {
    try {
      const { data } = await axiosInstance.get("/admin/category/get-categories");
      return data;
    } catch (error) {
      handleError(error)
    }
  };

  // Update category
export const updateCategory = async (editingCategoryId: string, formData: any) => {
    try {
      const response = await axiosInstance.put(
        `/admin/category/update-category/${editingCategoryId}`,
        formData
      );
      return response.data;
    } catch (error) {
      handleError(error)
    }
  };
  
  // Delete category
  export const deleteCategory = async (id: string) => {
    try {
      const response = await axiosInstance.delete(
        `/admin/category/delete-category/${id}`
      );
      return response.data;
    } catch (error) {
      handleError(error)
    }
  };

  // Fetch subcategories
export const fetchSubCategoriesService = async (categoryId: string): Promise<any[]> => {
    try {
      const { data } = await axiosInstance.get(
        `/admin/subcategory/get-subcategories/${categoryId}`
      );
      return data;
    } catch (error) {
      handleError(error)
    }
  };
  
  // Update subcategory
  export const updateSubCategory = async (editingSubCategoryId: string, formData: any) => {
    try {
      const response = await axiosInstance.put(
        `/admin/subcategory/update-subcategory/${editingSubCategoryId}`,
        formData
      );
      return response.data;
    } catch (error) {
      handleError(error)
    }
  };
  
  // Delete subcategory
  export const deleteSubCategory = async (id: string) => {
    try {
      const response = await axiosInstance.delete(
        `/admin/subcategory/delete-subcategory/${id}`
      );
      return response.data;
    } catch (error) {
      handleError(error)
    }
  };
  
  // Fetch skills
  export const fetchSkillsService = async (subcategoryId: string): Promise<any[]> => {
    try {
      const { data } = await axiosInstance.get(
        `/admin/skills/get-skills/${subcategoryId}`
      );
      return data;
    } catch (error) {
      handleError(error)
    }
  };
  
  // Update skill
  export const updateSkill = async (editingSkillId: string, formData: any) => {
    try {
      const response = await axiosInstance.put(
        `/admin/skills/update-skill/${editingSkillId}`,
        formData
      );
      return response.data;
    } catch (error) {
      handleError(error)
    }
  };
  
  // Delete skill
  export const deleteSkill = async (id: string) => {
    try {
      const response = await axiosInstance.delete(
        `/admin/skills/delete-skill/${id}`
      );
      return response.data;
    } catch (error) {
      handleError(error)
    }
  };

  // Get all skills
  export const getAllSkills = async () => {
    try {
      const response = await axiosInstance.get(
        `/mentors/get-allSkills`
      );
      return response.data;
    } catch (error) {
      handleError(error)
    }
  };

