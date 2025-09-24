import { Request } from 'express';
import { ICategory } from "../../Interfaces/Models/i-category";

//Types for category controller
export interface CategoryRequest extends Request {
  body: Partial<ICategory>;
  params: { id?: string };
}