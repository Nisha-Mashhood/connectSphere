import { ICategoryDTO } from './ICategoryDTO';
import { ISubcategoryDTO } from './ISubCategoryDTO';

export interface ISkillDTO {
  id: string;
  skillId: string;
  name: string;
  categoryId: string;
  category?: ICategoryDTO;
  subcategoryId: string;
  subcategory?: ISubcategoryDTO;
  description?: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}