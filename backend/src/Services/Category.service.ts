import { inject, injectable } from "inversify";
import { ICategoryRepository } from "../Interfaces/Repository/ICategoryRepository";
import { ISubcategoryRepository } from "../Interfaces/Repository/ISubCategoryRepository";
import { ISkillsRepository } from "../Interfaces/Repository/ISkillsRepository";
import { ICategory } from "../Interfaces/Models/ICategory";
import logger from "../Core/Utils/Logger";
import { uploadMedia } from "../Core/Utils/Cloudinary";
import { ServiceError } from "../Core/Utils/ErrorHandler";
import { ICategoryService } from "../Interfaces/Services/ICategoryService";
import { StatusCodes } from "../Enums/StatusCode.constants";

@injectable()
export class CategoryService implements ICategoryService {
  private categoryRepo: ICategoryRepository;
  private subcategoryRepo: ISubcategoryRepository;
  private skillsRepo: ISkillsRepository;

  constructor(
    @inject('ICategoryRepository') categoryRepository : ICategoryRepository,
    @inject('ISubcategoryRepository') subcategoryRepository : ISubcategoryRepository,
    @inject('ISkillsRepository') skillsRepository : ISkillsRepository
  ) {
    this.categoryRepo = categoryRepository;
    this.subcategoryRepo = subcategoryRepository;
    this.skillsRepo = skillsRepository;
  }

  isDuplicateCategoryName = async (
    name?: string,
    excludeId?: string
  ): Promise<boolean> => {
    try {
      logger.debug(`Checking duplicate category name: ${name}`);
      const isDuplicate = await this.categoryRepo.isDuplicateCategoryName(
        name,
        excludeId
      );
      return isDuplicate;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(
        `Error checking duplicate category name ${name}: ${err.message}`
      );
      throw new ServiceError(
        "Failed to check duplicate category name",
        StatusCodes.INTERNAL_SERVER_ERROR,
        err
      );
    }
  };

  createCategory = async (
    data: Partial<ICategory>,
    imagePath?: string,
    fileSize?: number
  ): Promise<ICategory> => {
    try {
      logger.debug(`Creating category with name: ${data.name}`);
      let imageId: string | null = null;
      if (imagePath) {
        const folder = "categories";
        const { url } = await uploadMedia(imagePath, folder, fileSize);
        imageId = url;
        logger.info(`Uploaded image for category: ${imageId}`);
      }
      const category = await this.categoryRepo.createCategory({
        ...data,
        imageId,
      });
      logger.info(`Category created: ${category._id} (${category.name})`);
      return category;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error creating category: ${err.message}`);
      throw new ServiceError(
        "Failed to create category",
        StatusCodes.INTERNAL_SERVER_ERROR,
        err
      );
    }
  };

  getAllCategories = async (
    query: {
      search?: string;
      page?: number;
      limit?: number;
      sort?: string;
    } = {}
  ): Promise<{ categories: ICategory[]; total: number }> => {
    try {
      logger.debug(
        `Fetching all categories with query: ${JSON.stringify(query)}`
      );
      const result = await this.categoryRepo.getAllCategories(query);
      logger.info(
        `Fetched ${result.categories.length} categories, total: ${result.total}`
      );
      return result;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error fetching categories: ${err.message}`);
      throw new ServiceError(
        "Failed to fetch categories",
        StatusCodes.INTERNAL_SERVER_ERROR,
        err
      );
    }
  };

  getCategoryById = async (id: string): Promise<ICategory | null> => {
    try {
      logger.debug(`Fetching category: ${id}`);
      const category = await this.categoryRepo.getCategoryById(id);
      if (!category) {
        logger.warn(`Category not found: ${id}`);
        throw new ServiceError("Category not found", StatusCodes.NOT_FOUND);
      }
      logger.info(`Category fetched: ${id} (${category.name})`);
      return category;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error fetching category ${id}: ${err.message}`);
      throw error instanceof ServiceError
        ? error
        : new ServiceError(
            "Failed to fetch category",
            StatusCodes.INTERNAL_SERVER_ERROR,
            err
          );
    }
  };

  updateCategory = async (
    id: string,
    data: Partial<ICategory>,
    imagePath?: string,
    fileSize?: number
  ): Promise<ICategory | null> => {
    try {
      logger.debug(`Updating category: ${id}`);
      let imageId: string | null = null;
      if (imagePath) {
        const folder = "categories";
        const { url } = await uploadMedia(imagePath, folder, fileSize);
        imageId = url;
        logger.info(`Uploaded image for category: ${imageId}`);
      }
      const category = await this.categoryRepo.updateCategory(id, {
        ...data,
        ...(imageId && { imageId }),
      });
      if (!category) {
        logger.warn(`Category not found for update: ${id}`);
        throw new ServiceError("Category not found", StatusCodes.NOT_FOUND);
      }
      logger.info(`Category updated: ${id} (${category.name})`);
      return category;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error updating category ${id}: ${err.message}`);
      throw error instanceof ServiceError
        ? error
        : new ServiceError(
            "Failed to update category",
            StatusCodes.INTERNAL_SERVER_ERROR,
            err
          );
    }
  };

  deleteCategory = async (id: string): Promise<ICategory | null> => {
    try {
      logger.debug(`Deleting category: ${id}`);
      await this.subcategoryRepo.deleteManySubcategories(id);
      logger.info(`Deleted subcategories for category: ${id}`);
      await this.skillsRepo.deleteManySkills(id);
      logger.info(`Deleted skills for category: ${id}`);
      const category = await this.categoryRepo.deleteCategory(id);
      if (!category) {
        logger.warn(`Category not found for deletion: ${id}`);
        throw new ServiceError("Category not found", StatusCodes.NOT_FOUND);
      }
      logger.info(`Category deleted: ${id} (${category.name})`);
      return category;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error deleting category ${id}: ${err.message}`);
      throw error instanceof ServiceError
        ? error
        : new ServiceError(
            "Failed to delete category and related data",
            StatusCodes.INTERNAL_SERVER_ERROR,
            err
          );
    }
  };
}
