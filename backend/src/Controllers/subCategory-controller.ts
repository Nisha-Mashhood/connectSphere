import { NextFunction, Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { ISubcategory } from "../Interfaces/Models/i-sub-category";
import { BaseController } from '../core/Controller/base-controller';
import logger from "../core/Utils/logger";
import { ISubcategoryController } from '../Interfaces/Controller/i-sub-category-controller';
import { HttpError } from '../core/Utils/error-handler';
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
    try {
      logger.debug(`Fetching subcategories for category: ${req.params.categoryId}`);
      const subcategories = await this._subcategoryService.getAllSubcategories(req.params.categoryId!);
      if (subcategories.length === 0) {
        this.sendSuccess(res, [], SUBCATEGORY_MESSAGES.NO_SUBCATEGORIES_FOUND);
        logger.info(`No subcategories found for category: ${req.params.categoryId}`);
        return;
      }
      this.sendSuccess(res, subcategories, SUBCATEGORY_MESSAGES.SUBCATEGORIES_FETCHED);
    } catch (error) {
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