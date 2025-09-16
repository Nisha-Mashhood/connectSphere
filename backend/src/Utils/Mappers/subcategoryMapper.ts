import { ISubcategory } from '../../Interfaces/Models/ISubcategory';
import { ISubcategoryDTO } from '../../Interfaces/DTOs/ISubCategoryDTO';

export function toSubcategoryDTO(subcategory: ISubcategory | null): ISubcategoryDTO | null {
  if (!subcategory) return null;

  return {
    id: subcategory._id.toString(),
    subcategoryId: subcategory.subcategoryId,
    name: subcategory.name,
    categoryId: subcategory.categoryId.toString(),
    description: subcategory.description,
    imageUrl: subcategory.imageUrl ?? null,
    createdAt: subcategory.createdAt,
    updatedAt: subcategory.updatedAt,
  };
}

export function toSubcategoryDTOs(subcategories: ISubcategory[]): ISubcategoryDTO[] {
  return subcategories.map(toSubcategoryDTO).filter((dto): dto is ISubcategoryDTO => dto !== null);
}
