import { ISubcategory } from '../../Interfaces/Models/ISubcategory';
import { ISubcategoryDTO } from '../../Interfaces/DTOs/ISubCategoryDTO';
import { ICategory } from '../../Interfaces/Models/ICategory';
import { toCategoryDTO } from './categoryMapper';
import logger from '../../Core/Utils/Logger';
import { Types } from 'mongoose';
import { ICategoryDTO } from '../../Interfaces/DTOs/ICategoryDTO';

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