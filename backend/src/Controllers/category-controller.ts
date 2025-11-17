import { Request, Response, NextFunction } from "express";
import { inject, injectable } from "inversify";
import { BaseController } from "../core/controller/base-controller";
import logger from "../core/utils/logger";
import { CategoryRequest } from "../Utils/types/category-types";
import { ICategoryController } from "../Interfaces/Controller/i-category-controller";
import { HttpError } from "../core/utils/error-handler";
import { StatusCodes } from "../enums/status-code-enums";
import { ICategoryService } from "../Interfaces/Services/i-category-service";
import { CATEGORY_MESSAGES } from "../constants/messages";
import { ERROR_MESSAGES } from "../constants/error-messages";

@injectable()
export class CategoryController extends BaseController implements ICategoryController {
  private _categoryService: ICategoryService;

  constructor(@inject('ICategoryService') categoryService : ICategoryService) {
    super();
    this._categoryService = categoryService;
  }

  createCategory = async (req: CategoryRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      logger.debug(`Creating category: ${req.body.name}`);
      if (!req.body.name) {
        throw new HttpError(ERROR_MESSAGES.REQUIRED_CATEGORY_NAME, StatusCodes.BAD_REQUEST);
      }
      const isDuplicate = await this._categoryService.isDuplicateCategoryName(req.body.name);
      if (isDuplicate) {
        throw new HttpError(ERROR_MESSAGES.DUPLICATE_CATEGORY_NAME, StatusCodes.BAD_REQUEST);
      }
      const imagePath = req.file?.path;
      const fileSize = req.file?.size;
      const category = await this._categoryService.createCategory(req.body, imagePath, fileSize);
      this.sendCreated(res, category, CATEGORY_MESSAGES.CATEGORY_CREATED);
    } catch (error) {
      next(error);
    }
  };

  getAllCategories = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { search, page, limit } = req.query;
      const query: any = {};

      if (search) query.search = search as string;
      if (page) query.page = parseInt(page as string, 10);
      if (limit) query.limit = parseInt(limit as string, 10);

      logger.debug(`Fetching categories with query: ${JSON.stringify(query)}`);

      const result = await this._categoryService.getAllCategories(query);

      if (!search) {
        if (result.categories.length === 0) {
          this.sendSuccess(res, { categories: [], 
          total: result.total,
          page: query.page || 1,
          limit: query.limit || 10, 
        }, CATEGORY_MESSAGES.NO_CATEGORIES_FOUND);
          logger.info("No categories found");
          return;
        }
        this.sendSuccess(res, { 
          categories: result.categories, 
          total: result.total,
          page: query.page || 1,
          limit: query.limit || 10, 
        }, CATEGORY_MESSAGES.CATEGORIES_FETCHED);
        logger.info(`Fetched ${result.categories.length} categories`);
        return;
      }

      if (result.categories.length === 0) {
        this.sendSuccess(
          res,
          {
            categories: [],
            total: 0,
            page: query.page || 1,
            limit: query.limit || 10,
          },
          query.search ? CATEGORY_MESSAGES.NO_CATEGORIES_FOUND_FOR_SEARCH : CATEGORY_MESSAGES.NO_CATEGORIES_FOUND
        );
        logger.info(`No categories found for query: ${JSON.stringify(query)}`);
        return;
      }

      this.sendSuccess(
        res,
        {
          categories: result.categories,
          total: result.total,
          page: query.page || 1,
          limit: query.limit || 10,
        },
        CATEGORY_MESSAGES.CATEGORIES_FETCHED
      );
    } catch (error) {
      logger.error(`Error fetching categories: ${error}`);
      next(error);
    }
  };

  fetchAllCategories = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this._categoryService.fetchAllCategories();

        if (result.categories.length === 0) {
          this.sendSuccess(res, { categories: [] }, CATEGORY_MESSAGES.NO_CATEGORIES_FOUND);
          logger.info("No categories found");
          return;
        }
        this.sendSuccess(res, { categories: result.categories }, CATEGORY_MESSAGES.CATEGORIES_FETCHED);
        logger.info(`Fetched ${result.categories.length} categories`);
        return;
    } catch (error) {
      logger.error(`Error fetching categories: ${error}`);
      next(error);
    }
  };

  getCategoryById = async (req: CategoryRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      logger.debug(`Fetching category: ${req.params.id}`);
      const category = await this._categoryService.getCategoryById(req.params.id!);
      if (!category) {
        this.sendSuccess(res, { category: null }, CATEGORY_MESSAGES.NO_CATEGORY_FOUND);
        logger.info(`No category found for ID: ${req.params.id}`);
        return;
      }
      this.sendSuccess(res, category, CATEGORY_MESSAGES.CATEGORY_FETCHED);
    } catch (error) {
      next(error);
    }
  };

  updateCategory = async (req: CategoryRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      logger.debug(`Updating category: ${req.params.id}`);
      if (!req.body.name) {
        throw new HttpError(ERROR_MESSAGES.REQUIRED_CATEGORY_NAME, StatusCodes.BAD_REQUEST);
      }
      const isDuplicate = await this._categoryService.isDuplicateCategoryName(req.body.name, req.params.id);
      if (isDuplicate) {
        throw new HttpError(ERROR_MESSAGES.DUPLICATE_CATEGORY_NAME, StatusCodes.BAD_REQUEST);
      }
      const imagePath = req.file?.path;
      const fileSize = req.file?.size;
      const updatedCategory = await this._categoryService.updateCategory(req.params.id!, req.body, imagePath, fileSize);
      if (!updatedCategory) {
        this.sendSuccess(res, { updatedCategory: null }, CATEGORY_MESSAGES.NO_CATEGORY_FOUND);
        logger.info(`No category found for ID: ${req.params.id}`);
        return;
      }
      this.sendSuccess(res, updatedCategory, CATEGORY_MESSAGES.CATEGORY_UPDATED);
    } catch (error) {
      next(error);
    }
  };

  deleteCategory = async (req: CategoryRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      logger.debug(`Deleting category: ${req.params.id}`);
      const deletedCategory = await this._categoryService.deleteCategory(req.params.id!);
      if (!deletedCategory) {
        this.sendSuccess(res, { deletedCategory: null }, CATEGORY_MESSAGES.NO_CATEGORY_FOUND);
        logger.info(`No category found for ID: ${req.params.id}`);
        return;
      }
      this.sendNoContent(res, CATEGORY_MESSAGES.CATEGORY_DELETED);
    } catch (error) {
      next(error);
    }
  };
}
