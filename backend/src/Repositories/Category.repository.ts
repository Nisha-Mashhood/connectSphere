import { injectable } from 'inversify';
import { ICategoryRepository } from "../Interfaces/Repository/ICategoryRepository";
import { BaseRepository } from "../Core/Repositries/BaseRepositry";
import { RepositoryError } from "../Core/Utils/ErrorHandler";
import logger from "../Core/Utils/Logger";
import { ICategory } from "../Interfaces/Models/ICategory";
import { Category } from "../Models/category.model";
import { StatusCodes } from "../Constants/StatusCode.constants";
import { Model } from "mongoose";

@injectable()
export class CategoryRepository extends BaseRepository<ICategory> implements ICategoryRepository {

  constructor() {
    super(Category as Model<ICategory>);
  }

  public createCategory = async(data: Partial<ICategory>): Promise<ICategory> => {
    try {
      logger.debug(`Creating category: ${data.name}`);
      const category = await this.create(data);
      logger.info(`Category created: ${category._id} (${category.name})`);
      return category;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error creating category`, err);
      throw new RepositoryError(
        "Failed to create category",
        StatusCodes.INTERNAL_SERVER_ERROR,
        err
      );
    }
  }

  public getAllCategories = async(
    query: { search?: string; page?: number; limit?: number; sort?: string } = {}
  ): Promise<{ categories: ICategory[]; total: number }> => {
    try {
      logger.debug(`Fetching all categories with query: ${JSON.stringify(query)}`);
      const { search, page = 1, limit = 10, sort } = query;

      if (!search && !sort) {
        const categories = await this.model.find().sort({ createdAt: -1 }).exec();
        logger.info(`Fetched ${categories.length} categories`);
        return { categories, total: categories.length };
      }

      const matchStage: Record<string, any> = {};
      if (search) {
        matchStage.name = { $regex: `^${search}`, $options: "i" };
      }

      const sortStage: Record<string, 1 | -1> =
        sort === "alphabetical" ? { name: 1 } : { createdAt: -1 };

      const pipeline = [
        { $match: matchStage },
        { $sort: sortStage },
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

      logger.info(`Fetched ${categories.length} categories, total: ${total}`);
      return { categories, total };
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error fetching categories`, err);
      throw new RepositoryError(
        "Failed to fetch categories",
        StatusCodes.INTERNAL_SERVER_ERROR,
        err
      );
    }
  }

  public getCategoryById = async(id: string): Promise<ICategory | null> => {
    try {
      logger.debug(`Fetching category by ID: ${id}`);
      const category = await this.findById(id);
      if (!category) {
        logger.warn(`Category not found: ${id}`);
        throw new RepositoryError(
          `Category not found with ID: ${id}`,
          StatusCodes.NOT_FOUND
        );
      }
      logger.info(`Category fetched: ${id} (${category.name})`);
      return category;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error fetching category by ID ${id}`, err);
      throw new RepositoryError(
        `Failed to fetch category by ID: ${id}`,
        StatusCodes.INTERNAL_SERVER_ERROR,
        err
      );
    }
  }

  public updateCategory = async(
    id: string,
    data: Partial<ICategory>
  ): Promise<ICategory | null> => {
    try {
      logger.debug(`Updating category: ${id}`);
      const category = await this.findByIdAndUpdate(id, data, { new: true });
      if (!category) {
        logger.warn(`Category not found for update: ${id}`);
        throw new RepositoryError(
          `Category not found for update: ${id}`,
          StatusCodes.NOT_FOUND
        );
      }
      logger.info(`Category updated: ${id} (${category.name})`);
      return category;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error updating category ${id}`, err);
      throw new RepositoryError(
        `Failed to update category: ${id}`,
        StatusCodes.INTERNAL_SERVER_ERROR,
        err
      );
    }
  }

  public deleteCategory = async(id: string): Promise<ICategory | null> =>{
    try {
      logger.debug(`Deleting category: ${id}`);
      const category = await this.findByIdAndDelete(id);
      if (!category) {
        logger.warn(`Category not found for deletion: ${id}`);
        throw new RepositoryError(
          `Category not found for deletion: ${id}`,
          StatusCodes.NOT_FOUND
        );
      }
      logger.info(`Category deleted: ${id} (${category.name})`);
      return category;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error deleting category ${id}`, err);
      throw new RepositoryError(
        `Failed to delete category: ${id}`,
        StatusCodes.INTERNAL_SERVER_ERROR,
        err
      );
    }
  }

  public isDuplicateCategoryName = async(
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
        `Failed to check duplicate category name`,
        StatusCodes.INTERNAL_SERVER_ERROR,
        err
      );
    }
  }
}
