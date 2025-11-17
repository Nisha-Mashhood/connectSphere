import { inject, injectable } from "inversify";
import { ISubcategory } from "../Interfaces/Models/i-sub-category";
import logger from "../core/utils/logger";
import { uploadMedia } from "../core/utils/cloudinary";
import { ServiceError } from "../core/utils/error-handler";
import { StatusCodes } from "../enums/status-code-enums";
import { ISubcategoryRepository } from "../Interfaces/Repository/i-sub-category-repositry";
import { ISkillsRepository } from "../Interfaces/Repository/i-skills-repositry";
import { ISubcategoryDTO } from "../Interfaces/DTOs/i-sub-category-dto";
import { ISubcategoryService } from "../Interfaces/Services/i-sub-category-service";
import { toSubcategoryDTO, toSubcategoryDTOs } from "../Utils/mappers/subcategory-mapper";

@injectable()
export class SubcategoryService  implements ISubcategoryService{
  private _subcategoryRepository: ISubcategoryRepository;
  private _skillsRepository: ISkillsRepository;

  constructor(
    @inject('ISubCategoryRepository') subcategoryRepository : ISubcategoryRepository,
    @inject('ISkillsRepository') skillsRepository : ISkillsRepository
  ) {
    this._subcategoryRepository = subcategoryRepository;
    this._skillsRepository = skillsRepository;
  }

   public createSubcategory = async (data: Partial<ISubcategory>, imagePath?: string, fileSize?: number): Promise<ISubcategoryDTO> => {
    try {
      logger.debug(`Creating subcategory: ${data.name} for category ${data.categoryId}`);

      if (!data.name || !data.categoryId) {
        logger.error("Missing required fields: name or categoryId");
        throw new ServiceError(
          "Subcategory name and category ID are required",
          StatusCodes.BAD_REQUEST
        );
      }

      const isDuplicate = await this._subcategoryRepository.isDuplicateSubcategory(data.name, data.categoryId.toString());
      if (isDuplicate) {
        logger.warn(`Subcategory name '${data.name}' already exists in category ${data.categoryId}`);
        throw new ServiceError(
          "Subcategory name already exists in this category",
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
      const subcategoryDTO = toSubcategoryDTO(subcategory);
      if (!subcategoryDTO) {
        logger.error(`Failed to map subcategory ${subcategory._id} to DTO`);
        throw new ServiceError(
          "Failed to map subcategory to DTO",
          StatusCodes.INTERNAL_SERVER_ERROR
        );
      }
      logger.info(`Subcategory created: ${subcategory._id} (${subcategory.name})`);
      return subcategoryDTO;
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

  public getAllSubcategories = async (
    categoryId: string,
    query: { search?: string; page?: number; limit?: number }
  ): Promise<{ subcategories: ISubcategoryDTO[]; total: number }> => {
    try {
      logger.debug(`Service: Fetching subcategories for category: ${categoryId}`);
      const result = await this._subcategoryRepository.getAllSubcategories(categoryId, query);
      const subcategoriesDTO = toSubcategoryDTOs(result.subcategories);
      return { subcategories: subcategoriesDTO, total: result.total };
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error in SubcategoryService: ${err.message}`);
      throw new ServiceError(
        "Failed to fetch subcategories",
        StatusCodes.INTERNAL_SERVER_ERROR,
        err
      );
    }
  };

  public getSubcategoryById = async (id: string): Promise<ISubcategoryDTO> => {
    try {
      logger.debug(`Fetching subcategory: ${id}`);
      const subcategory = await this._subcategoryRepository.getSubcategoryById(id);
      if (!subcategory) {
        logger.warn(`Subcategory not found: ${id}`);
        throw new ServiceError("Subcategory not found", StatusCodes.NOT_FOUND);
      }
      const subcategoryDTO = toSubcategoryDTO(subcategory);
      if (!subcategoryDTO) {
        logger.error(`Failed to map subcategory ${id} to DTO`);
        throw new ServiceError(
          "Failed to map subcategory to DTO",
          StatusCodes.INTERNAL_SERVER_ERROR
        );
      }
      logger.info(`Subcategory fetched: ${id} (${subcategory.name})`);
      return subcategoryDTO;
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
  ): Promise<ISubcategoryDTO> => {
    try {
      logger.debug(`Updating subcategory: ${id}`);
      if (data.name) {
        const existingSubcategory = await this._subcategoryRepository.getSubcategoryById(id);
        if (!existingSubcategory) {
          logger.warn(`Subcategory not found for update: ${id}`);
          throw new ServiceError("Subcategory not found", StatusCodes.NOT_FOUND);
        }
        const isDuplicate = await this._subcategoryRepository.isDuplicateSubcategory(
          data.name,
          existingSubcategory.categoryId._id.toString(),
          id
        );
        if (isDuplicate) {
          logger.warn(`Subcategory name '${data.name}' already exists in category ${existingSubcategory.categoryId}`);
          throw new ServiceError(
            "Subcategory name already exists in this category",
            StatusCodes.BAD_REQUEST
          );
        }
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

      const subcategoryDTO = toSubcategoryDTO(subcategory);
      if (!subcategoryDTO) {
        logger.error(`Failed to map subcategory ${id} to DTO`);
        throw new ServiceError(
          "Failed to map subcategory to DTO",
          StatusCodes.INTERNAL_SERVER_ERROR
        );
      }
      logger.info(`Subcategory updated: ${id} (${subcategory.name})`);
      return subcategoryDTO;
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

  public deleteSubcategory = async (id: string): Promise<ISubcategoryDTO> => {
    try {
      logger.debug(`Deleting subcategory: ${id}`);
      await this._skillsRepository.deleteManySkillsBySubcategoryId(id);
      logger.info(`Deleted skills for subcategory: ${id}`);

      const subcategory = await this._subcategoryRepository.deleteSubcategory(id);
      if (!subcategory) {
        logger.warn(`Subcategory not found for deletion: ${id}`);
        throw new ServiceError("Subcategory not found", StatusCodes.NOT_FOUND);
      }

      const subcategoryDTO = toSubcategoryDTO(subcategory);
      if (!subcategoryDTO) {
        logger.error(`Failed to map subcategory ${id} to DTO`);
        throw new ServiceError(
          "Failed to map subcategory to DTO",
          StatusCodes.INTERNAL_SERVER_ERROR
        );
      }
      logger.info(`Subcategory deleted: ${id} (${subcategory.name})`);
      return subcategoryDTO;
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
  };
}