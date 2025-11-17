import { NextFunction, Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { ISubcategory } from "../Interfaces/Models/i-sub-category";
import { BaseController } from '../core/controller/base-controller';
import logger from "../core/utils/logger";
import { ISubcategoryController } from '../Interfaces/Controller/i-sub-category-controller';
import { HttpError } from '../core/utils/error-handler';
import { ISubcategoryService } from '../Interfaces/Services/i-sub-category-service';
import { SUBCATEGORY_MESSAGES } from '../constants/messages';
import { ERROR_MESSAGES } from '../constants/error-messages';
import { StatusCodes } from '../enums/status-code-enums';


interface SubcategoryRequest extends Request {
  body: Partial<ISubcategory>;
  params: { id?: string; categoryId?: string };
}

@injectable()
export class SubcategoryController extends BaseController implements ISubcategoryController{
  private _subcategoryService: ISubcategoryService;

  constructor(
    @inject('ISubCategoryService') subCategoryService : ISubcategoryService,
) {
    super();
    this._subcategoryService = subCategoryService;
  }

   createSubcategory = async (req: SubcategoryRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      logger.debug(`Creating subcategory: ${req.body.name}`);
      const imagePath = req.file?.path;
      const fileSize = req.file?.size;
      const subcategory = await this._subcategoryService.createSubcategory(req.body, imagePath, fileSize);
      this.sendCreated(res, subcategory, SUBCATEGORY_MESSAGES.SUBCATEGORY_CREATED);
    } catch (error) {
      next(error);
    }
  };

  getAllSubcategories = async (req: SubcategoryRequest, res: Response, next: NextFunction): Promise<void> => {
    logger.debug(`Fetching subcategories for category: ${req.params.categoryId}`);
    try {
          const { categoryId } = req.params;
          const { search, page, limit } = req.query;
          const query: any = {};
    
          if (search) query.search = search as string;
          if (page) query.page = parseInt(page as string, 10);
          if (limit) query.limit = parseInt(limit as string, 10);
    
          logger.debug(`Fetching sub-categories with query: ${JSON.stringify(query)}`);
    
          const result = await this._subcategoryService.getAllSubcategories(categoryId!, query);
    
          if (!search) {
            if (result.subcategories.length === 0) {
              this.sendSuccess(res, { subcategories: [], 
              total: result.total,
              page: query.page || 1,
              limit: query.limit || 10, 
            }, SUBCATEGORY_MESSAGES.NO_SUBCATEGORIES_FOUND);
              logger.info("No sub-categories found");
              return;
            }
            this.sendSuccess(res, { 
              subcategories: result.subcategories, 
              total: result.total,
              page: query.page || 1,
              limit: query.limit || 10, 
            }, SUBCATEGORY_MESSAGES.SUBCATEGORIES_FETCHED);
            logger.info(`Fetched ${result.subcategories.length} sub-categories`);
            return;
          }
    
          if (result.subcategories.length === 0) {
            this.sendSuccess(
              res,
              {
                subcategories: [],
                total: 0,
                page: query.page || 1,
                limit: query.limit || 10,
              },
              query.search ? SUBCATEGORY_MESSAGES.NO_SUBCATEGORIES_FOUND : SUBCATEGORY_MESSAGES.NO_SUBCATEGORIES_FOUND
            );
            logger.info(`No categories found for query: ${JSON.stringify(query)}`);
            return;
          }
    
          this.sendSuccess(
            res,
            {
              subcategories: result.subcategories,
              total: result.total,
              page: query.page || 1,
              limit: query.limit || 10,
            },
            SUBCATEGORY_MESSAGES.SUBCATEGORIES_FETCHED
          );
        } catch (error) {
          logger.error(`Error fetching sub-categories: ${error}`);
          next(error);
        }
  };

  getSubcategoryById = async (req: SubcategoryRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      logger.debug(`Fetching subcategory: ${req.params.id}`);
      const subcategory = await this._subcategoryService.getSubcategoryById(req.params.id!);
      if (!subcategory) {
        throw new HttpError(ERROR_MESSAGES.SUBCATEGORY_NOT_FOUND, StatusCodes.NOT_FOUND);
      }
      this.sendSuccess(res, subcategory, SUBCATEGORY_MESSAGES.SUBCATEGORY_FETCHED);
    } catch (error) {
      next(error);
    }
  };

  updateSubcategory = async (req: SubcategoryRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      logger.debug(`Updating subcategory: ${req.params.id}`);
      const imagePath = req.file?.path;
      const fileSize = req.file?.size;
      const updatedSubcategory = await this._subcategoryService.updateSubcategory(req.params.id!, req.body, imagePath, fileSize);
      if (!updatedSubcategory) {
        throw new HttpError(ERROR_MESSAGES.SUBCATEGORY_NOT_FOUND, StatusCodes.NOT_FOUND);
      }
      this.sendSuccess(res, updatedSubcategory, SUBCATEGORY_MESSAGES.SUBCATEGORY_UPDATED);
    } catch (error) {
      next(error);
    }
  };

  deleteSubcategory = async (req: SubcategoryRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      logger.debug(`Deleting subcategory: ${req.params.id}`);
      const deletedSubcategory = await this._subcategoryService.deleteSubcategory(req.params.id!);
      if (!deletedSubcategory) {
        throw new HttpError(ERROR_MESSAGES.SUBCATEGORY_NOT_FOUND, StatusCodes.NOT_FOUND);
      }
      this.sendNoContent(res, SUBCATEGORY_MESSAGES.SUBCATEGORY_DELETED);
    } catch (error) {
      next(error);
    }
  };
}