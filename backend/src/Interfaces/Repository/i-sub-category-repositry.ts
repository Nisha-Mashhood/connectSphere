import {  ISubcategory } from "../Models/i-sub-category";

export interface ISubcategoryRepository {
  createSubcategory(data: Partial<ISubcategory>): Promise<ISubcategory>;
  getAllSubcategories(categoryId: string): Promise<ISubcategory[]>;
  getSubcategoryById(id: string): Promise<ISubcategory | null>;
  updateSubcategory(id: string, data: Partial<ISubcategory>): Promise<ISubcategory | null>;
  deleteSubcategory(id: string): Promise<ISubcategory | null>;
  deleteManySubcategories(categoryId: string): Promise<{ deletedCount: number }>;
  isDuplicateSubcategory(name: string, categoryId: string, excludeId?: string): Promise<boolean>;
}