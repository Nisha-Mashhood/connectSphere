import { ISubcategoryDTO } from "../DTOs/ISubCategoryDTO";
import { ISubcategory } from "../Models/ISubcategory";

export interface ISubcategoryService {
  createSubcategory: (data: Partial<ISubcategory>, imagePath?: string, fileSize?: number) => Promise<ISubcategoryDTO>;
  getAllSubcategories: (categoryId: string) => Promise<ISubcategoryDTO[]>;
  getSubcategoryById: (id: string) => Promise<ISubcategoryDTO | null>;
  updateSubcategory: (id: string, data: Partial<ISubcategory>, imagePath?: string, fileSize?: number) => Promise<ISubcategoryDTO | null>;
  deleteSubcategory: (id: string) => Promise<ISubcategoryDTO | null>;
}