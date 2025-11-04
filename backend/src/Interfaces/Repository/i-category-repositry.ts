import { ICategory } from "../Models/i-category";

export interface ICategoryRepository {
  createCategory(data: Partial<ICategory>): Promise<ICategory>;

  getAllCategories(query?: {
    search?: string;
    page?: number;
    limit?: number;
    sort?: string;
  }): Promise<{ categories: ICategory[]; total: number }>;

  fetchAllCategories(): Promise<{ categories: ICategory[] }>

  getCategoryById(id: string): Promise<ICategory | null>;

  updateCategory(
    id: string,
    data: Partial<ICategory>
  ): Promise<ICategory | null>;

  deleteCategory(id: string): Promise<ICategory | null>;

  isDuplicateCategoryName(name?: string, excludeId?: string): Promise<boolean>;
}