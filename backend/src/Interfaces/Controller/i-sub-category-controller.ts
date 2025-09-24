import { Request, Response } from "express";
import { ISubcategory } from "../Models/i-sub-category";
import type { Express, NextFunction } from "express";

export interface SubcategoryRequest extends Request {
  body: Partial<ISubcategory>;
  params: { id?: string; categoryId?: string };
  file?: Express.Multer.File;
}

export interface ISubcategoryController {
  createSubcategory(req: SubcategoryRequest, res: Response, next:NextFunction): Promise<void>;
  getAllSubcategories(req: SubcategoryRequest, res: Response, next:NextFunction): Promise<void>;
  getSubcategoryById(req: SubcategoryRequest, res: Response, next:NextFunction): Promise<void>;
  updateSubcategory(req: SubcategoryRequest, res: Response, next:NextFunction): Promise<void>;
  deleteSubcategory(req: SubcategoryRequest, res: Response, next:NextFunction): Promise<void>;
}