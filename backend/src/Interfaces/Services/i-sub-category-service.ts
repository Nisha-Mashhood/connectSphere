import { ISubcategoryDTO } from "../DTOs/i-sub-category-dto";
import { ISubcategory } from "../Models/i-sub-category";

export interface ISubcategoryService {
  createSubcategory: (data: Partial<ISubcategory>, imagePath?: string, fileSize?: number) => Promise<ISubcategoryDTO>;
  getAllSubcategories: (categoryId: string) => Promise<ISubcategoryDTO[]>;
  getSubcategoryById: (id: string) => Promise<ISubcategoryDTO | null>;
  updateSubcategory: (id: string, data: Partial<ISubcategory>, imagePath?: string, fileSize?: number) => Promise<ISubcategoryDTO | null>;
  deleteSubcategory: (id: string) => Promise<ISubcategoryDTO | null>;
}