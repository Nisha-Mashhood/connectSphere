export interface ISubcategoryDTO {
  id: string;
  subcategoryId: string;
  name: string;
  categoryId: string;
  description?: string;
  imageUrl?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
