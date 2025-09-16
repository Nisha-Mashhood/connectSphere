import { inject, injectable } from "inversify";
import { ISubcategory } from "../Interfaces/Models/ISubcategory";
import logger from "../Core/Utils/Logger";
import { uploadMedia } from "../Core/Utils/Cloudinary";
import { ServiceError } from "../Core/Utils/ErrorHandler";
import { StatusCodes } from "../Constants/StatusCode.constants";
import { ISubcategoryRepository } from "../Interfaces/Repository/ISubCategoryRepository";
import { ISkillsRepository } from "../Interfaces/Repository/ISkillsRepository";

@injectable()
export class SubcategoryService  {
  private _subcategoryRepository: ISubcategoryRepository;
  private _skillsRepository: ISkillsRepository;

  constructor(
    @inject('ISubcategoryRepository') subcategoryRepository : ISubcategoryRepository,
    @inject('ISkillsRepository') skillsRepository : ISkillsRepository
  ) {
    this._subcategoryRepository = subcategoryRepository;
    this._skillsRepository = skillsRepository;
  }

   public createSubcategory = async (data: Partial<ISubcategory>, imagePath?: string, fileSize?: number): Promise<ISubcategory> => {
    try {
      logger.debug(`Creating subcategory: ${data.name} for category ${data.categoryId}`);

      if (!data.name || !data.categoryId) {
        logger.error("Missing required fields: name or categoryId");
        throw new ServiceError(
          "Subcategory name and category ID are required",
          StatusCodes.BAD_REQUEST
        );
      }

      let imageUrl: string | null = null;
      if (imagePath) {
        const folder = "sub-categories";
        const { url } = await uploadMedia(imagePath, folder, fileSize);
        imageUrl = url;
        logger.info(`Uploaded image for subcategory: ${imageUrl}`);
      }

      const subcategory = await this._subcategoryRepository.createSubcategory({ ...data, imageUrl });
      logger.info(`Subcategory created: ${subcategory._id} (${subcategory.name})`);
      return subcategory;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error creating subcategory ${data.name}: ${err.message}`);
      throw error instanceof ServiceError
        ? error
        : new ServiceError(
            "Failed to create subcategory",
            StatusCodes.INTERNAL_SERVER_ERROR,
            err
          );
    }
  };

  public getAllSubcategories = async (categoryId: string): Promise<ISubcategory[]> => {
    try {
      logger.debug(`Fetching subcategories for category: ${categoryId}`);
      const subcategories = await this._subcategoryRepository.getAllSubcategories(categoryId);
      logger.info(`Fetched ${subcategories.length} subcategories for category: ${categoryId}`);
      return subcategories;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error fetching subcategories for category ${categoryId}: ${err.message}`);
      throw error instanceof ServiceError
        ? error
        : new ServiceError(
            "Failed to fetch subcategories",
            StatusCodes.INTERNAL_SERVER_ERROR,
            err
          );
    }
  };

  public getSubcategoryById = async (id: string): Promise<ISubcategory | null> => {
    try {
      logger.debug(`Fetching subcategory: ${id}`);
      const subcategory = await this._subcategoryRepository.getSubcategoryById(id);
      if (!subcategory) {
        logger.warn(`Subcategory not found: ${id}`);
        throw new ServiceError("Subcategory not found", StatusCodes.NOT_FOUND);
      }

      logger.info(`Subcategory fetched: ${id} (${subcategory.name})`);
      return subcategory;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error fetching subcategory ${id}: ${err.message}`);
      throw error instanceof ServiceError
        ? error
        : new ServiceError(
            "Failed to fetch subcategory",
            StatusCodes.INTERNAL_SERVER_ERROR,
            err
          );
    }
  };

  public updateSubcategory = async (
    id: string,
    data: Partial<ISubcategory>,
    imagePath?: string,
    fileSize?: number
  ): Promise<ISubcategory | null> => {
    try {
      logger.debug(`Updating subcategory: ${id}`);
      if (data.categoryId) {
        logger.error("Invalid category ID in update data");
        throw new ServiceError(
          "Category ID must be a valid ObjectId",
          StatusCodes.BAD_REQUEST
        );
      }

      let imageUrl: string | null = null;
      if (imagePath) {
        const folder = "sub-categories";
        const { url } = await uploadMedia(imagePath, folder, fileSize);
        imageUrl = url;
        logger.info(`Uploaded image for subcategory: ${imageUrl}`);
      }

      const subcategory = await this._subcategoryRepository.updateSubcategory(id, {
        ...data,
        ...(imageUrl && { imageUrl }),
      });
      if (!subcategory) {
        logger.warn(`Subcategory not found for update: ${id}`);
        throw new ServiceError("Subcategory not found", StatusCodes.NOT_FOUND);
      }

      logger.info(`Subcategory updated: ${id} (${subcategory.name})`);
      return subcategory;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error updating subcategory ${id}: ${err.message}`);
      throw error instanceof ServiceError
        ? error
        : new ServiceError(
            "Failed to update subcategory",
            StatusCodes.INTERNAL_SERVER_ERROR,
            err
          );
    }
  };

  public deleteSubcategory = async (id: string): Promise<ISubcategory | null> => {
    try {
      logger.debug(`Deleting subcategory: ${id}`);
      await this._skillsRepository.deleteManySkillsBySubcategoryId(id);
      logger.info(`Deleted skills for subcategory: ${id}`);

      const subcategory = await this._subcategoryRepository.deleteSubcategory(id);
      if (!subcategory) {
        logger.warn(`Subcategory not found for deletion: ${id}`);
        throw new ServiceError("Subcategory not found", StatusCodes.NOT_FOUND);
      }

      logger.info(`Subcategory deleted: ${id} (${subcategory.name})`);
      return subcategory;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error deleting subcategory ${id}: ${err.message}`);
      throw error instanceof ServiceError
        ? error
        : new ServiceError(
            "Failed to delete subcategory and related data",
            StatusCodes.INTERNAL_SERVER_ERROR,
            err
          );
    }
  }
}