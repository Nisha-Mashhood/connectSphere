import { ICategoryDTO } from './i-category-dto';
import { ISubcategoryDTO } from './i-sub-category-dto';

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