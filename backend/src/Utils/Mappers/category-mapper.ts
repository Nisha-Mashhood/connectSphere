import { ICategory } from '../../Interfaces/Models/i-category';
import { ICategoryDTO } from '../../Interfaces/DTOs/i-category-dto';
import logger from '../../core/Utils/logger';

export function toCategoryDTO(category: ICategory | null): ICategoryDTO | null {
  if (!category) {
    logger.warn('Attempted to map null category to DTO');
    return null;
  }

  return {
    id: category._id.toString(),
    categoryId: category.categoryId,
    name: category.name,
    description: category.description,
    imageId: category.imageId ?? undefined,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
  };
}

export function toCategoryDTOs(categories: ICategory[]): ICategoryDTO[] {
  return categories
    .map(toCategoryDTO)
    .filter((dto): dto is ICategoryDTO => dto !== null);
}