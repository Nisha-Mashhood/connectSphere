import { NextFunction, Request, Response } from 'express';
import { inject } from 'inversify';
import { ISubcategory } from "../Interfaces/Models/ISubcategory";
import { BaseController } from '../Core/Controller/BaseController';
import logger from "../Core/Utils/Logger";
import { ISubcategoryController } from '../Interfaces/Controller/ISubCategoryController';
import { HttpError } from '../Core/Utils/ErrorHandler';
// import { StatusCodes } from "../Constants/StatusCode.enums";
import { ISubcategoryService } from '../Interfaces/Services/ISubCategoryService';
// import { ISubcategoryRepository } from '../Interfaces/Repository/ISubCategoryRepository';


interface SubcategoryRequest extends Request {
  body: Partial<ISubcategory>;
  params: { id?: string; categoryId?: string };
}

export class SubcategoryController extends BaseController implements ISubcategoryController{
  private _subcategoryService: ISubcategoryService;
  // private subcategoryRepo: ISubcategoryRepository;

  constructor(
    @inject('ISubcategoryService') subCategoryService : ISubcategoryService,
    // @inject('ISubcategoryRepository') subcategoryRepository : ISubcategoryRepository
) {
    super();
    this._subcategoryService = subCategoryService;
    // this.subcategoryRepo = subcategoryRepository;
  }

   createSubcategory  = async(req: SubcategoryRequest, res: Response, next:NextFunction): Promise<void> => {
    try {
      logger.debug(`Creating subcategory: ${req.body.name}`);
      // const isDuplicate = await this.subcategoryRepo.findOne({ name: req.body.name, categoryId: req.body.categoryId });
      // if (isDuplicate) {
      //   throw new HttpError('Subcategory name already exists in this category', StatusCodes.BAD_REQUEST);
      // }
      const imagePath = req.file?.path;
      const fileSize = req.file?.size;
      const subcategory = await this._subcategoryService.createSubcategory(req.body, imagePath, fileSize);
      this.sendCreated(res, subcategory, 'Subcategory created successfully');
    } catch (error) {
      next(error)
    }
  }

   getAllSubcategories  = async(req: SubcategoryRequest, res: Response, next:NextFunction): Promise<void> => {
    try {
      logger.debug(`Fetching subcategories for category: ${req.params.categoryId}`);
      const subcategories = await this._subcategoryService.getAllSubcategories(req.params.categoryId!);
      if (subcategories.length === 0) {
        this.sendSuccess(res, [], 'No subcategories found for this category');
        logger.info(`No subcategories found for category: ${req.params.categoryId}`);
        return;
      }
      this.sendSuccess(res, subcategories, 'Subcategories fetched successfully');
    } catch (error) {
      next(error)
    }
  }

   getSubcategoryById  = async(req: SubcategoryRequest, res: Response, next:NextFunction): Promise<void> => {
    try {
      logger.debug(`Fetching subcategory: ${req.params.id}`);
      const subcategory = await this._subcategoryService.getSubcategoryById(req.params.id!);
      if (!subcategory) {
        throw new HttpError('Subcategory not found', 404);
      }
      this.sendSuccess(res, subcategory, 'Subcategory fetched successfully');
    } catch (error) {
      next(error)
    }
  }

   updateSubcategory  = async(req: SubcategoryRequest, res: Response, next:NextFunction): Promise<void> => {
    try {
      logger.debug(`Updating subcategory: ${req.params.id}`);
      // const isDuplicate = await this.subcategoryRepo.findOne({
      //   name: req.body.name,
      //   categoryId: req.body.categoryId || (await this.subcategoryRepo.getSubcategoryById(req.params.id!))?.categoryId,
      //   _id: { $ne: req.params.id },
      // });
      // if (isDuplicate) {
      //   throw new HttpError('Subcategory name already exists in this category', StatusCodes.BAD_REQUEST);
      // }
      const imagePath = req.file?.path;
      const fileSize = req.file?.size;
      const updatedSubcategory = await this._subcategoryService.updateSubcategory(req.params.id!, req.body, imagePath, fileSize);
      if (!updatedSubcategory) {
        throw new HttpError('Subcategory not found', 404);
      }
      this.sendSuccess(res, updatedSubcategory, 'Subcategory updated successfully');
    } catch (error) {
      next(error)
    }
  }

   deleteSubcategory  = async(req: SubcategoryRequest, res: Response, next:NextFunction): Promise<void> =>{
    try {
      logger.debug(`Deleting subcategory: ${req.params.id}`);
      const deletedSubcategory = await this._subcategoryService.deleteSubcategory(req.params.id!);
      if (!deletedSubcategory) {
        throw new HttpError('Subcategory not found', 404);
      }
      this.sendNoContent(res, 'Subcategory deleted successfully');
    } catch (error) {
      next(error)
    }
  }
}