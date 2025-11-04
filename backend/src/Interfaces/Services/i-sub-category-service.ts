import { ISubcategoryDTO } from "../DTOs/i-sub-category-dto";
import { ISubcategory } from "../Models/i-sub-category";

export interface ISubcategoryService {
  createSubcategory: (data: Partial<ISubcategory>, imagePath?: string, fileSize?: number) => Promise<ISubcategoryDTO>;
  getAllSubcategories: (categoryId: string, query: { search?: string; page?: number; limit?: number }) => Promise<{ subcategories: ISubcategoryDTO[]; total: number }>
  getSubcategoryById: (id: string) => Promise<ISubcategoryDTO | null>;
  updateSubcategory: (id: string, data: Partial<ISubcategory>, imagePath?: string, fileSize?: number) => Promise<ISubcategoryDTO | null>;
  deleteSubcategory: (id: string) => Promise<ISubcategoryDTO | null>;
}