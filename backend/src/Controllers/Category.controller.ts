import { Request, Response, NextFunction } from "express";
import { inject, injectable } from "inversify";
import { BaseController } from "../Core/Controller/BaseController";
import logger from "../Core/Utils/Logger";
import { CategoryRequest } from "../Utils/Types/Category.types";
import { ICategoryController } from "../Interfaces/Controller/ICategoryController";
import { HttpError } from "../Core/Utils/ErrorHandler";
import { StatusCodes } from "../Enums/StatusCode.enums";
import { ICategoryService } from "../Interfaces/Services/ICategoryService";

@injectable()
export class CategoryController extends BaseController implements ICategoryController {
  private _categoryService: ICategoryService;

  constructor(@inject('ICategoryService') categoryService : ICategoryService) {
    super();
    this._categoryService = categoryService;
  }

  createCategory = async (
    req: CategoryRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      logger.debug(`Creating category: ${req.body.name}`);
      if (!req.body.name) {
        throw new HttpError("Category Name is required", StatusCodes.BAD_REQUEST);
      }
      const isDuplicate = await this._categoryService.isDuplicateCategoryName(
        req.body.name
      );
      if (isDuplicate) {
        throw new HttpError("Category name already exists", StatusCodes.BAD_REQUEST);
      }
      const imagePath = req.file?.path;
      const fileSize = req.file?.size;
      const category = await this._categoryService.createCategory(
        req.body,
        imagePath,
        fileSize
      );
      this.sendCreated(res, category, "Category created successfully");
    } catch (error) {
      next(error);
    }
  };

  getAllCategories = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { search, page, limit, sort } = req.query;
      const query: any = {};

      if (search) query.search = search as string;
      if (page) query.page = parseInt(page as string, 10);
      if (limit) query.limit = parseInt(limit as string, 10);
      if (sort) query.sort = sort as string;

      logger.debug(`Fetching categories with query: ${JSON.stringify(query)}`);

      const result = await this._categoryService.getAllCategories(query);

      // If no search or sort, return all categories without pagination
      if (!search && !sort) {
        if (result.categories.length === 0) {
          this.sendSuccess(res, { categories: [] }, "No categories found");
          logger.info("No categories found");
          return;
        }
        this.sendSuccess(
          res,
          { categories: result.categories },
          "Categories fetched successfully"
        );
        logger.info(`Fetched ${result.categories.length} categories`);
        return;
      }

      // Apply pagination when search or sort is provided
      if (result.categories.length === 0) {
        this.sendSuccess(
          res,
          {
            categories: [],
            total: 0,
            page: query.page || 1,
            limit: query.limit || 10,
          },
          query.search
            ? `No categories found for search term "${query.search}"`
            : "No categories found"
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
        "Categories fetched successfully"
      );
      logger.info(
        `Fetched ${result.categories.length} categories, total: ${result.total}`
      );
    } catch (error) {
      logger.error(`Error fetching categories: ${error}`);
      next(error);
    }
  };

  getCategoryById = async (
    req: CategoryRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      logger.debug(`Fetching category: ${req.params.id}`);
      const category = await this._categoryService.getCategoryById(
        req.params.id!
      );
      if (!category) {
        this.sendSuccess(
          res,
          { category: null },
          "No category found for the provided ID"
        );
        logger.info(`No category found for ID: ${req.params.id}`);
        return;
      }
      this.sendSuccess(res, category, "Category fetched successfully");
    } catch (error) {
      next(error);
    }
  };

  updateCategory = async (
    req: CategoryRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      logger.debug(`Updating category: ${req.params.id}`);
      if (!req.body.name) {
        throw new HttpError("Category Name is required", StatusCodes.BAD_REQUEST);
      }
      const isDuplicate = await this._categoryService.isDuplicateCategoryName(
        req.body.name,
        req.params.id
      );
      if (isDuplicate) {
        throw new HttpError("Category name already exists", StatusCodes.BAD_REQUEST);
      }
      const imagePath = req.file?.path;
      const fileSize = req.file?.size;
      const updatedCategory = await this._categoryService.updateCategory(
        req.params.id!,
        req.body,
        imagePath,
        fileSize
      );
      if (!updatedCategory) {
        this.sendSuccess(
          res,
          { updatedCategory: null },
          "No category found for the provided ID"
        );
        logger.info(`No category found for ID: ${req.params.id}`);
        return;
      }
      this.sendSuccess(res, updatedCategory, "Category updated successfully");
    } catch (error) {
      next(error);
    }
  };

  deleteCategory = async (
    req: CategoryRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      logger.debug(`Deleting category: ${req.params.id}`);
      const deletedCategory = await this._categoryService.deleteCategory(
        req.params.id!
      );
      if (!deletedCategory) {
        this.sendSuccess(
          res,
          { deletedCategory: null },
          "No category found for the provided ID"
        );
        logger.info(`No category found for ID: ${req.params.id}`);
        return;
      }
      this.sendNoContent(res, "Category deleted successfully");
    } catch (error) {
      next(error);
    }
  };
}
