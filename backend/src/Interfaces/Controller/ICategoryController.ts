import { Request, Response, NextFunction } from "express";
import { CategoryRequest } from "../../Utils/Types/Category.types";


export interface ICategoryController {
  createCategory(req: CategoryRequest, res: Response, next:NextFunction): Promise<void>;
  getAllCategories(req: Request, res: Response, next:NextFunction): Promise<void>;
  getCategoryById(req: CategoryRequest, res: Response, next:NextFunction): Promise<void>;
  updateCategory(req: CategoryRequest, res: Response, next:NextFunction): Promise<void>;
  deleteCategory(req: CategoryRequest, res: Response, next:NextFunction): Promise<void>;
}
