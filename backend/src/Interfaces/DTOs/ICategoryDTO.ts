export interface ICategoryDTO {
  id: string;
  categoryId: string;
  name: string;
  description?: string;
  imageUrl?: string | null;
  createdAt: Date;
  updatedAt: Date;
}