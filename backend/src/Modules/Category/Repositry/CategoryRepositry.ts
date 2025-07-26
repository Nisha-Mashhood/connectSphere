import { BaseRepository } from "../../../core/Repositries/BaseRepositry";
import { RepositoryError } from "../../../core/Utils/ErrorHandler";
import logger from "../../../core/Utils/Logger";
import { CategoryInterface as ICategory } from "../../../Interfaces/models/CategoryInterface";
import { Category } from "../../../models/category.model";

export class CategoryRepository extends BaseRepository<ICategory> {
  constructor() {
    super(Category);
  }

   createCategory = async(data: Partial<ICategory>): Promise<ICategory> => {
    try {
      logger.debug(`Creating category: ${data.name}`);
      const category = await this.create(data);
      logger.info(`Category created: ${category._id} (${category.name})`);
      return category;
    } catch (error) {
      logger.error(`Error creating category: ${error}`);
      throw new RepositoryError(`Failed to create category: ${error}`);
    }
  }

   getAllCategories = async (query: { search?: string; page?: number; limit?: number; sort?: string } = {}): Promise<{ categories: ICategory[]; total: number }> => {
    try {
      logger.debug(`Fetching all categories with query: ${JSON.stringify(query)}`);
      const { search, page = 1, limit = 10, sort } = query;

      // If no search or sort, return all categories sorted by createdAt (descending)
      if (!search && !sort) {
        const categories = await this.model
          .find()
          .sort({ createdAt: -1 }) 
          .exec();
        logger.info(`Fetched ${categories.length} categories`);
        return { categories, total: categories.length };
      }

      // Build aggregation pipeline for search, sort, and pagination
      const matchStage: any = {};
      if (search) {
        matchStage.name = { $regex: `^${search}`, $options: 'i' };
      }

      const sortStage: any = sort === 'alphabetical' ? { name: 1 } : { createdAt: -1 };

      const pipeline = [
        { $match: matchStage },
        { $sort: sortStage },
        {
          $facet: {
            categories: [
              { $skip: ((page - 1) * limit) },
              { $limit: limit },
            ],
            total: [{ $count: 'count' }],
          },
        },
      ];

      const result = await this.model.aggregate(pipeline).exec();
      const categories = result[0]?.categories || [];
      const total = result[0]?.total[0]?.count || 0;

      logger.info(`Fetched ${categories.length} categories, total: ${total}`);
      return { categories, total };
    } catch (error) {
      logger.error(`Error fetching categories: ${error}`);
      throw new RepositoryError('Failed to fetch categories');
    }
  }

   getCategoryById = async(id: string): Promise<ICategory | null> => {
    try {
      logger.debug(`Fetching category by ID: ${id}`);
      const category = await this.findById(id);
      if (!category) {
        logger.warn(`Category not found: ${id}`);
      } else {
        logger.info(`Category fetched: ${id} (${category.name})`);
      }
      return category;
    } catch (error) {
      logger.error(`Error fetching category by ID ${id}: ${error}`);
      throw new RepositoryError(`Failed to fetch category: ${error}`);
    }
  }

   updateCategory = async(
    id: string,
    data: Partial<ICategory>
  ): Promise<ICategory | null> => {
    try {
      logger.debug(`Updating category: ${id}`);
      const category = await this.findByIdAndUpdate(id, data, { new: true });
      if (!category) {
        logger.warn(`Category not found for update: ${id}`);
      } else {
        logger.info(`Category updated: ${id} (${category.name})`);
      }
      return category;
    } catch (error) {
      logger.error(`Error updating category ${id}: ${error}`);
      throw new RepositoryError(`Failed to update category: ${error}`);
    }
  }

   deleteCategory = async(id: string): Promise<ICategory | null> => {
    try {
      logger.debug(`Deleting category: ${id}`);
      const category = await this.findByIdAndDelete(id);
      if (!category) {
        logger.warn(`Category not found for deletion: ${id}`);
      } else {
        logger.info(`Category deleted: ${id} (${category.name})`);
      }
      return category;
    } catch (error) {
      logger.error(`Error deleting category ${id}: ${error}`);
      throw new RepositoryError(`Failed to delete category: ${error}`);
    }
  }

   isDuplicateCategoryName = async(
    name?: string,
    excludeId?: string
  ): Promise<boolean> => {
    try {
      logger.debug(`Checking duplicate category name: ${name}`);
      const filter: any = { name };
      if (excludeId) {
        filter._id = { $ne: excludeId };
      }
      const existingCategory = await this.findOne(filter);
      const isDuplicate = !!existingCategory;
      logger.info(`Duplicate check for category name ${name}: ${isDuplicate}`);
      return isDuplicate;
    } catch (error) {
      logger.error(`Error checking duplicate category name ${name}: ${error}`);
      throw new RepositoryError(
        `Failed to check duplicate category name: ${error}`
      );
    }
  }
}
