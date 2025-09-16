import { ISubcategory } from "../Models/ISubcategory";

export interface ISubcategoryService {
  createSubcategory: (data: Partial<ISubcategory>, imagePath?: string, fileSize?: number) => Promise<ISubcategory>;
  getAllSubcategories: (categoryId: string) => Promise<ISubcategory[]>;
  getSubcategoryById: (id: string) => Promise<ISubcategory | null>;
  updateSubcategory: (id: string, data: Partial<ISubcategory>, imagePath?: string, fileSize?: number) => Promise<ISubcategory | null>;
  deleteSubcategory: (id: string) => Promise<ISubcategory | null>;
}