import { ICategory } from "./ICategory";
import { ISubCategory } from "./ISubCategory";

export interface ISkill {
  id: string;
  skillId?: string;
  name: string;
  description: string;
  imageUrl: string;
  categoryId: string;
  category:ICategory;
  subcategoryId: string;
  subcategory:ISubCategory;
  createdAt: string;
  updatedAt: string;
}