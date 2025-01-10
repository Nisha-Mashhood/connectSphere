import { axiosInstance } from "../lib/axios";

export const createCategory = async (formData) => {
    try {
        await axiosInstance.post("admin/category/create-category",formData);
    } catch (error) {
      throw error.response?.data?.message || "Category Creation Failed"; 
    }
  };

  export const createSubCategory = async (formData) => {
    try {
         await axiosInstance.post("admin/subcategory/create-subcategory", formData);
    } catch (error) {
      throw error.response?.data?.message || "Sub-Category Creation Failed"; 
    }
  };

  export const createSkill = async (formData) => {
    try {
        await axiosInstance.post("admin/skills/create-skill", formData);
    } catch (error) {
      throw error.response?.data?.message || "Skill Creation Failed"; 
    }
  };

  //Fetch categories
  export const fetchCategoriesService = async (): Promise<any[]> => {
    try {
      const { data } = await axiosInstance.get("/admin/category/get-categories");
      return data;
    } catch (error) {
      throw new Error("Failed to fetch categories");
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
      throw new Error("Failed to update category");
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
      throw new Error("Failed to delete category");
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
      throw new Error("Failed to fetch subcategories");
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
      throw new Error("Failed to update subcategory");
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
      throw new Error("Failed to delete subcategory");
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
      throw new Error("Failed to fetch skills");
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
      throw new Error("Failed to update skill");
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
      throw new Error("Failed to delete skill");
    }
  };

  // Delete skill
  export const getAllSkills = async () => {
    try {
      const response = await axiosInstance.get(
        `/mentors/get-allSkills`
      );
      return response.data;
    } catch (error) {
      throw new Error("Failed to get skills");
    }
  };

