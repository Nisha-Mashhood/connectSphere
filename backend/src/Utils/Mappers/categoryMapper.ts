import { ICategory } from '../../Interfaces/Models/ICategory';
import { ICategoryDTO } from '../../Interfaces/DTOs/ICategoryDTO';
import logger from '../../Core/Utils/Logger';

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