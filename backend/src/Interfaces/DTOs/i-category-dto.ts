export interface ICategoryDTO {
  id: string;
  categoryId: string;
  name: string;
  description?: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}