import { inject, injectable } from "inversify";
import { ICategoryRepository } from "../Interfaces/Repository/i-category-repositry";
import { ISubcategoryRepository } from "../Interfaces/Repository/i-sub-category-repositry";
import { ISkillsRepository } from "../Interfaces/Repository/i-skills-repositry";
import { ICategory } from "../Interfaces/Models/i-category";
import logger from "../core/utils/logger";
import { uploadMedia } from "../core/utils/cloudinary";
import { ServiceError } from "../core/utils/error-handler";
import { ICategoryService } from "../Interfaces/Services/i-category-service";
import { StatusCodes } from "../enums/status-code-enums";
import { toCategoryDTO, toCategoryDTOs } from "../Utils/mappers/category-mapper";
import { ICategoryDTO } from "../Interfaces/DTOs/i-category-dto";

@injectable()
export class CategoryService implements ICategoryService {
  private categoryRepo: ICategoryRepository;
  private subcategoryRepo: ISubcategoryRepository;
  private skillsRepo: ISkillsRepository;

  constructor(
    @inject('ICategoryRepository') categoryRepository : ICategoryRepository,
    @inject('ISubCategoryRepository') subcategoryRepository : ISubcategoryRepository,
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
  ): Promise<ICategoryDTO> => {
    try {
      logger.debug(`Creating category with name: ${data.name}`);
      let imageUrl: string = '';
      if (imagePath) {
        const folder = "categories";
        const { url } = await uploadMedia(imagePath, folder, fileSize);
        imageUrl = url;
        logger.info(`Uploaded image for category: ${imageUrl}`);
      }
      const category = await this.categoryRepo.createCategory({
        ...data,
        imageUrl,
      });
      const categoryDTO = toCategoryDTO(category);
      if (!categoryDTO) {
        logger.error(`Failed to map category ${category._id} to DTO`);
        throw new ServiceError(
          "Failed to map category to DTO",
          StatusCodes.INTERNAL_SERVER_ERROR
        );
      }
      logger.info(`Category created: ${category._id} (${category.name})`);
      return categoryDTO;
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
    } = {}
  ): Promise<{ categories: ICategoryDTO[]; total: number }> => {
    try {
      logger.debug(
        `Fetching all categories with query: ${JSON.stringify(query)}`
      );
      const result = await this.categoryRepo.getAllCategories(query);
      const categoriesDTO = toCategoryDTOs(result.categories);;
      logger.info(`Fetched categories with total ${result.total}`);
      return { categories: categoriesDTO, total: result.total };
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

  fetchAllCategories = async (): Promise<{ categories: ICategoryDTO[]}> => {
    try {
      logger.debug(`Fetching all categories`);
      const result = await this.categoryRepo.fetchAllCategories();
      const categoriesDTO = toCategoryDTOs(result.categories);;
      return { categories: categoriesDTO };
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

  getCategoryById = async (id: string): Promise<ICategoryDTO | null> => {
    try {
      logger.debug(`Fetching category: ${id}`);
      const category = await this.categoryRepo.getCategoryById(id);
      if (!category) {
        logger.warn(`Category not found: ${id}`);
        throw new ServiceError("Category not found", StatusCodes.NOT_FOUND);
      }
      const categoryDTO = toCategoryDTO(category);
      if (!categoryDTO) {
        logger.error(`Failed to map category ${id} to DTO`);
        throw new ServiceError(
          "Failed to map category to DTO",
          StatusCodes.INTERNAL_SERVER_ERROR
        );
      }
      logger.info(`Category fetched: ${id} (${category.name})`);
      return categoryDTO;
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
  ): Promise<ICategoryDTO | null> => {
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
      const categoryDTO = toCategoryDTO(category);
      if (!categoryDTO) {
        logger.error(`Failed to map category ${id} to DTO`);
        throw new ServiceError(
          "Failed to map category to DTO",
          StatusCodes.INTERNAL_SERVER_ERROR
        );
      }
      logger.info(`Category updated: ${id} (${category.name})`);
      return categoryDTO;
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

  deleteCategory = async (id: string): Promise<ICategoryDTO | null> => {
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
      const categoryDTO = toCategoryDTO(category);
      if (!categoryDTO) {
        logger.error(`Failed to map category ${id} to DTO`);
        throw new ServiceError(
          "Failed to map category to DTO",
          StatusCodes.INTERNAL_SERVER_ERROR
        );
      }
      logger.info(`Category deleted: ${id} (${category.name})`);
      return categoryDTO;
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
