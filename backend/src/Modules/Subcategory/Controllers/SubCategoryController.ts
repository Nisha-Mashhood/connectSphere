import { Request, Response } from 'express';
import { SubcategoryService } from '../Service/SubCategoryService.js';
import { SubcategoryRepository } from "../Repositry/SubCategoryRepositry.js";
import { SubcategoryInterface as ISubcategory } from "../../../Interfaces/models/SubcategoryInterface.js";
import { BaseController } from '../../../core/Controller/BaseController.js';
import logger from "../../../core/Utils/Logger.js";


interface SubcategoryRequest extends Request {
  body: Partial<ISubcategory>;
  params: { id?: string; categoryId?: string };
}

export class SubcategoryController extends BaseController {
  private subcategoryService: SubcategoryService;
  private subcategoryRepo: SubcategoryRepository;

  constructor() {
    super();
    this.subcategoryService = new SubcategoryService();
    this.subcategoryRepo = new SubcategoryRepository();
  }

   createSubcategory  = async(req: SubcategoryRequest, res: Response): Promise<void> => {
    try {
      logger.debug(`Creating subcategory: ${req.body.name}`);
      const isDuplicate = await this.subcategoryRepo.findOne({ name: req.body.name, categoryId: req.body.categoryId });
      if (isDuplicate) {
        this.throwError(400, 'Subcategory name already exists in this category');
      }
      const imagePath = req.file?.path;
      const fileSize = req.file?.size;
      const subcategory = await this.subcategoryService.createSubcategory(req.body, imagePath, fileSize);
      this.sendCreated(res, subcategory, 'Subcategory created successfully');
    } catch (error) {
      this.handleError(error, res);
    }
  }

   getAllSubcategories  = async(req: SubcategoryRequest, res: Response): Promise<void> => {
    try {
      logger.debug(`Fetching subcategories for category: ${req.params.categoryId}`);
      const subcategories = await this.subcategoryService.getAllSubcategories(req.params.categoryId!);
      this.sendSuccess(res, subcategories, 'Subcategories fetched successfully');
    } catch (error) {
      this.handleError(error, res);
    }
  }

   getSubcategoryById  = async(req: SubcategoryRequest, res: Response): Promise<void> => {
    try {
      logger.debug(`Fetching subcategory: ${req.params.id}`);
      const subcategory = await this.subcategoryService.getSubcategoryById(req.params.id!);
      if (!subcategory) {
        this.throwError(404, 'Subcategory not found');
      }
      this.sendSuccess(res, subcategory, 'Subcategory fetched successfully');
    } catch (error) {
      this.handleError(error, res);
    }
  }

   updateSubcategory  = async(req: SubcategoryRequest, res: Response): Promise<void> => {
    try {
      logger.debug(`Updating subcategory: ${req.params.id}`);
      const isDuplicate = await this.subcategoryRepo.findOne({
        name: req.body.name,
        categoryId: req.body.categoryId || (await this.subcategoryRepo.getSubcategoryById(req.params.id!))?.categoryId,
        _id: { $ne: req.params.id },
      });
      if (isDuplicate) {
        this.throwError(400, 'Subcategory name already exists in this category');
      }
      const imagePath = req.file?.path;
      const fileSize = req.file?.size;
      const updatedSubcategory = await this.subcategoryService.updateSubcategory(req.params.id!, req.body, imagePath, fileSize);
      if (!updatedSubcategory) {
        this.throwError(404, 'Subcategory not found');
      }
      this.sendSuccess(res, updatedSubcategory, 'Subcategory updated successfully');
    } catch (error) {
      this.handleError(error, res);
    }
  }

   deleteSubcategory  = async(req: SubcategoryRequest, res: Response): Promise<void> =>{
    try {
      logger.debug(`Deleting subcategory: ${req.params.id}`);
      const deletedSubcategory = await this.subcategoryService.deleteSubcategory(req.params.id!);
      if (!deletedSubcategory) {
        this.throwError(404, 'Subcategory not found');
      }
      this.sendNoContent(res, 'Subcategory deleted successfully');
    } catch (error) {
      this.handleError(error, res);
    }
  }
}