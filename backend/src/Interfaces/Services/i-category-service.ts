import { ICategoryDTO } from "../DTOs/i-category-dto";
import { ICategory } from "../Models/i-category";

export interface ICategoryService {
  isDuplicateCategoryName: (name?: string, excludeId?: string) => Promise<boolean>;
  createCategory: (data: Partial<ICategory>, imagePath?: string, fileSize?: number) => Promise<ICategoryDTO>;
  fetchAllCategories (): Promise<{ categories: ICategoryDTO[]}>;
  getAllCategories: (query: { search?: string; page?: number; limit?: number; sort?: string }) => Promise<{ categories: ICategoryDTO[]; total: number }>;
  getCategoryById: (id: string) => Promise<ICategoryDTO | null>;
  updateCategory: (id: string, data: Partial<ICategory>, imagePath?: string, fileSize?: number) => Promise<ICategoryDTO | null>;
  deleteCategory: (id: string) => Promise<ICategoryDTO | null>;
}