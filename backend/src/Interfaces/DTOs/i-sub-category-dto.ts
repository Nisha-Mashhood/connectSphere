import { ICategoryDTO } from './i-category-dto';

export interface ISubcategoryDTO {
  id: string;
  subcategoryId: string;
  name: string;
  categoryId: string;
  category?: ICategoryDTO;
  description?: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}