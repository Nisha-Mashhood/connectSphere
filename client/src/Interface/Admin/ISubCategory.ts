import { ICategory } from "./ICategory";

export interface ISubCategory {
  id: string;
  subcategoryId?:string;
  name: string;
  description: string;
  imageUrl: string;
  categoryId: string;
  category: ICategory;
  createdAt: string;
  updatedAt: string;
}

