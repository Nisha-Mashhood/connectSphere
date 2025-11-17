import { ISubcategory } from '../../Interfaces/Models/i-sub-category';
import { ISubcategoryDTO } from '../../Interfaces/DTOs/i-sub-category-dto';
import { ICategory } from '../../Interfaces/Models/i-category';
import { toCategoryDTO } from './category-mapper';
import logger from '../../core/utils/logger';
import { Types } from 'mongoose';
import { ICategoryDTO } from '../../Interfaces/DTOs/i-category-dto';

export function toSubcategoryDTO(subcategory: ISubcategory | null): ISubcategoryDTO | null {
  if (!subcategory) {
    logger.warn('Attempted to map null subcategory to DTO');
    return null;
  }

  let categoryId: string;
  let category: ICategoryDTO | undefined;

  if (subcategory.categoryId) {
    if (typeof subcategory.categoryId === 'string') {
      categoryId = subcategory.categoryId;
    } else if (subcategory.categoryId instanceof Types.ObjectId) {
      categoryId = subcategory.categoryId.toString();
    } else {
      //ICategory object (populated)
      categoryId = (subcategory.categoryId as ICategory)._id.toString();
      const categoryDTO = toCategoryDTO(subcategory.categoryId as ICategory);
      category = categoryDTO ?? undefined;
    }
  } else {
    logger.warn(`Subcategory ${subcategory._id} has no categoryId`);
    categoryId = '';
  }

  return {
    id: subcategory._id.toString(),
    subcategoryId: subcategory.subcategoryId,
    name: subcategory.name,
    categoryId,
    category,
    description: subcategory.description,
    imageUrl: subcategory.imageUrl ?? undefined,
    createdAt: subcategory.createdAt,
    updatedAt: subcategory.updatedAt,
  };
}

export function toSubcategoryDTOs(subcategories: ISubcategory[]): ISubcategoryDTO[] {
  return subcategories
    .map(toSubcategoryDTO)
    .filter((dto): dto is ISubcategoryDTO => dto !== null);
}