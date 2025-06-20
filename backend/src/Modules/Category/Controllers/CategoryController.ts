import { Request, Response } from 'express';
import { CategoryService } from '../Service/CategoryService.js';
import { CategoryInterface as ICategory } from "../../../Interfaces/models/CategoryInterface.js";
import { BaseController } from '../../../core/Controller/BaseController.js';
import logger from "../../../core/Utils/Logger.js";

interface CategoryRequest extends Request {
  body: Partial<ICategory>;
  params: { id?: string };
}

export class CategoryController extends BaseController {
  private categoryService: CategoryService;

  constructor() {
    super();
    this.categoryService = new CategoryService();
  }

   createCategory = async(req: CategoryRequest, res: Response): Promise<void> => {
    try {
      logger.debug(`Creating category: ${req.body.name}`);
      if (!req.body.name) {
        this.throwError(400, 'Category Name is required');
      }
      const isDuplicate = await this.categoryService.isDuplicateCategoryName(req.body.name);
      if (isDuplicate) {
        this.throwError(400, 'Category name already exists');
      }
      const imagePath = req.file?.path;
      const fileSize = req.file?.size;
      const category = await this.categoryService.createCategory(req.body, imagePath, fileSize);
      this.sendCreated(res, category, 'Category created successfully');
    } catch (error) {
      this.handleError(error, res);
    }
  }

   getAllCategories = async(_req: Request, res: Response): Promise<void> => {
    try {
      logger.debug('Fetching all categories');
      const categories = await this.categoryService.getAllCategories();
      this.sendSuccess(res, categories, 'Categories fetched successfully');
    } catch (error) {
      this.handleError(error, res);
    }
  }

   getCategoryById = async(req: CategoryRequest, res: Response): Promise<void> => {
    try {
      logger.debug(`Fetching category: ${req.params.id}`);
      const category = await this.categoryService.getCategoryById(req.params.id!);
      if (!category) {
        this.throwError(404, 'Category not found');
      }
      this.sendSuccess(res, category, 'Category fetched successfully');
    } catch (error) {
      this.handleError(error, res);
    }
  }

   updateCategory = async(req: CategoryRequest, res: Response): Promise<void> => {
    try {
      logger.debug(`Updating category: ${req.params.id}`);
      if (!req.body.name) {
        this.throwError(400, 'Category Name is required');
      }
      const isDuplicate = await this.categoryService.isDuplicateCategoryName(req.body.name, req.params.id);
      if (isDuplicate) {
        this.throwError(400, 'Category name already exists');
      }
      const imagePath = req.file?.path;
      const fileSize = req.file?.size;
      const updatedCategory = await this.categoryService.updateCategory(req.params.id!, req.body, imagePath, fileSize);
      if (!updatedCategory) {
        this.throwError(404, 'Category not found');
      }
      this.sendSuccess(res, updatedCategory, 'Category updated successfully');
    } catch (error) {
      this.handleError(error, res);
    }
  }

   deleteCategory = async(req: CategoryRequest, res: Response): Promise<void> => {
    try {
      logger.debug(`Deleting category: ${req.params.id}`);
      const deletedCategory = await this.categoryService.deleteCategory(req.params.id!);
      if (!deletedCategory) {
        this.throwError(404, 'Category not found');
      }
      this.sendNoContent(res, 'Category deleted successfully');
    } catch (error) {
      this.handleError(error, res);
    }
  }
}