import { ICategory } from "../Models/ICategory";

export interface ICategoryService {
  isDuplicateCategoryName: (name?: string, excludeId?: string) => Promise<boolean>;
  createCategory: (data: Partial<ICategory>, imagePath?: string, fileSize?: number) => Promise<ICategory>;
  getAllCategories: (query: { search?: string; page?: number; limit?: number; sort?: string }) => Promise<{ categories: ICategory[]; total: number }>;
  getCategoryById: (id: string) => Promise<ICategory | null>;
  updateCategory: (id: string, data: Partial<ICategory>, imagePath?: string, fileSize?: number) => Promise<ICategory | null>;
  deleteCategory: (id: string) => Promise<ICategory | null>;
}