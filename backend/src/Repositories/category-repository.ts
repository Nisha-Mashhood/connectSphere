import { injectable } from "inversify";
import { ICategoryRepository } from "../Interfaces/Repository/i-category-repositry";
import { BaseRepository } from "../core/repositries/base-repositry";
import { RepositoryError } from "../core/utils/error-handler";
import logger from "../core/utils/logger";
import { ICategory } from "../Interfaces/Models/i-category";
import { Category } from "../Models/category-model";
import { StatusCodes } from "../enums/status-code-enums";
import { Model } from "mongoose";
import { ERROR_MESSAGES } from "../constants/error-messages";

@injectable()
export class CategoryRepository
  extends BaseRepository<ICategory>
  implements ICategoryRepository
{
  constructor() {
    super(Category as Model<ICategory>);
  }

  public createCategory = async (
    data: Partial<ICategory>
  ): Promise<ICategory> => {
    try {
      logger.debug(`Creating category: ${data.name}`);
      const category = await this.create(data);
      logger.info(`Category created: ${category._id} (${category.name})`);
      return category;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error creating category`, err);
      throw new RepositoryError(
        ERROR_MESSAGES.FAILED_TO_CREATE_CATEGORY,
        StatusCodes.INTERNAL_SERVER_ERROR,
        err
      );
    }
  };

  public getAllCategories = async (
    query: {
      search?: string;
      page?: number;
      limit?: number;
    } = {}
  ): Promise<{ categories: ICategory[]; total: number }> => {
    try {
      logger.debug(
        `Fetching all categories with query: ${JSON.stringify(query)}`
      );
      const { search, page = 1, limit = 10 } = query;

      if (!search) {
        const categories = await this.model
          .find()
          .sort({ createdAt: -1 })
          .exec();
          logger.info(`Fetched ${JSON.stringify(categories)} categories`);
        return { categories, total: categories.length };
      }

      const matchStage: Record<string, any> = {};
      if (search) {
        matchStage.name = { $regex: `${search}`, $options: "i" };
      }

      const pipeline = [
        { $match: matchStage },
        {
          $project: {
            _id: 1,
            categoryId: 1,
            name: 1,
            description: 1,
            imageUrl: 1,
            createdAt: 1,
            updatedAt: 1,
          },
        },
        {
          $facet: {
            categories: [{ $skip: (page - 1) * limit }, { $limit: limit }],
            total: [{ $count: "count" }],
          },
        },
      ];

      const result = await this.model.aggregate(pipeline).exec();
      const categories: ICategory[] = result[0]?.categories || [];
      const total: number = result[0]?.total[0]?.count || 0;
      logger.info(`Fetched categories with total ${total}`);
      return { categories, total };
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error fetching categories`, err);
      throw new RepositoryError(
        ERROR_MESSAGES.FAILED_TO_FETCH_CATEGORIES,
        StatusCodes.INTERNAL_SERVER_ERROR,
        err
      );
    }
  };

  public fetchAllCategories = async (): Promise<{ categories: ICategory[] }> => {
    try {
      logger.debug( `Fetching all categories` );

        const categories = await this.model
          .find()
          .sort({ createdAt: -1 })
          .exec();
          logger.info(`Fetched ${JSON.stringify(categories)} categories`);
        return { categories };
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error fetching categories`, err);
      throw new RepositoryError(
        ERROR_MESSAGES.FAILED_TO_FETCH_CATEGORIES,
        StatusCodes.INTERNAL_SERVER_ERROR,
        err
      );
    }
  };

  public getCategoryById = async (id: string): Promise<ICategory | null> => {
    try {
      logger.debug(`Fetching category by ID: ${id}`);
      const category = await this.findById(id);
      if (!category) {
        logger.warn(`Category not found: ${id}`);
        throw new RepositoryError(
          `${ERROR_MESSAGES.CATEGORY_NOT_FOUND} with ID: ${id}`,
          StatusCodes.NOT_FOUND
        );
      }
      logger.info(`Category fetched: ${id} (${category.name})`);
      return category;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error fetching category by ID ${id}`, err);
      throw new RepositoryError(
        `${ERROR_MESSAGES.FAILED_TO_FETCH_CATEGORY_BY_ID} ${id}`,
        StatusCodes.INTERNAL_SERVER_ERROR,
        err
      );
    }
  };

  public updateCategory = async (
    id: string,
    data: Partial<ICategory>
  ): Promise<ICategory | null> => {
    try {
      logger.debug(`Updating category: ${id}`);
      const category = await this.findByIdAndUpdate(id, data, { new: true });
      if (!category) {
        logger.warn(`Category not found for update: ${id}`);
        throw new RepositoryError(
          `${ERROR_MESSAGES.CATEGORY_NOT_FOUND} for update: ${id}`,
          StatusCodes.NOT_FOUND
        );
      }
      logger.info(`Category updated: ${id} (${category.name})`);
      return category;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error updating category ${id}`, err);
      throw new RepositoryError(
        `${ERROR_MESSAGES.FAILED_TO_UPDATE_CATEGORY} ${id}`,
        StatusCodes.INTERNAL_SERVER_ERROR,
        err
      );
    }
  };

  public deleteCategory = async (id: string): Promise<ICategory | null> => {
    try {
      logger.debug(`Deleting category: ${id}`);
      const category = await this.findByIdAndDelete(id);
      if (!category) {
        logger.warn(`Category not found for deletion: ${id}`);
        throw new RepositoryError(
          `${ERROR_MESSAGES.CATEGORY_NOT_FOUND} for deletion: ${id}`,
          StatusCodes.NOT_FOUND
        );
      }
      logger.info(`Category deleted: ${id} (${category.name})`);
      return category;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error deleting category ${id}`, err);
      throw new RepositoryError(
        `${ERROR_MESSAGES.FAILED_TO_DELETE_CATEGORY} ${id}`,
        StatusCodes.INTERNAL_SERVER_ERROR,
        err
      );
    }
  };

  public isDuplicateCategoryName = async (
    name?: string,
    excludeId?: string
  ): Promise<boolean> => {
    try {
      logger.debug(`Checking duplicate category name: ${name}`);
      const filter: Record<string, any> = { name };
      if (excludeId) {
        filter._id = { $ne: excludeId };
      }
      const existingCategory = await this.findOne(filter);
      const isDuplicate = !!existingCategory;
      logger.info(`Duplicate check for category name ${name}: ${isDuplicate}`);
      return isDuplicate;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error checking duplicate category name ${name}`, err);
      throw new RepositoryError(
        ERROR_MESSAGES.FAILED_TO_CHECK_DUPLICATE_CATEGORY,
        StatusCodes.INTERNAL_SERVER_ERROR,
        err
      );
    }
  };
}
