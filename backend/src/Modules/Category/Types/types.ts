import { Request } from 'express';
import { CategoryInterface as ICategory } from "../../../Interfaces/models/CategoryInterface";

//Types for category controller
export interface CategoryRequest extends Request {
  body: Partial<ICategory>;
  params: { id?: string };
}