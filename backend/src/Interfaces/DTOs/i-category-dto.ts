export interface ICategoryDTO {
  id: string;
  categoryId: string;
  name: string;
  description?: string;
  imageId?: string;
  createdAt: Date;
  updatedAt: Date;
}