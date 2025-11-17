import { injectable } from "inversify";
import { Model, Types } from "mongoose";
import { BaseRepository } from "../core/repositries/base-repositry";
import { RepositoryError } from "../core/utils/error-handler";
import logger from "../core/utils/logger";
import { ISubcategory } from "../Interfaces/Models/i-sub-category";
import { Subcategory } from "../Models/sub-category-model";
import { StatusCodes } from "../enums/status-code-enums";
import { ISubcategoryRepository } from "../Interfaces/Repository/i-sub-category-repositry";

@injectable()
export class SubcategoryRepository extends BaseRepository<ISubcategory> implements ISubcategoryRepository{
  constructor() {
    super(Subcategory as Model<ISubcategory>);
  }

   public createSubcategory = async(data: Partial<ISubcategory>): Promise<ISubcategory> => {
    try {
      logger.debug(`Creating subcategory: ${data.name} for category ${data.categoryId}`);
      const subcategory = await this.create(data);
      logger.info(`Subcategory created: ${subcategory._id} (${subcategory.name})`);
      return subcategory;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error creating subcategory ${data.name}`, err);
      throw new RepositoryError('Error creating subcategory', StatusCodes.INTERNAL_SERVER_ERROR, err);
    }
  }

   public getAllSubcategories = async (
    categoryId: string,
    query: { search?: string; page?: number; limit?: number }
  ): Promise<{ subcategories: ISubcategory[]; total: number }> => {
    try {
      logger.debug(
        `Fetching subcategories for category: ${categoryId} with query: ${JSON.stringify(query)}`
      );

      const { search, page = 1, limit = 10 } = query;

      const matchStage: Record<string, any> = {
        categoryId: new Types.ObjectId(categoryId),
      };

      if (search) {
        matchStage.name = { $regex: `${search}`, $options: "i" };
      }

      const pipeline = [
        { $match: matchStage },
        {
          $project: {
            _id: 1,
            subcategoryId: 1,
            name: 1,
            description: 1,
            imageUrl: 1,
            categoryId: 1,
            createdAt: 1,
            updatedAt: 1,
          },
        },
        {
          $facet: {
            subcategories: [
              { $skip: (page - 1) * limit },
              { $limit: limit },
            ],
            total: [{ $count: "count" }],
          },
        },
      ]

      const result = await this.model.aggregate(pipeline).exec();

      const subcategories: ISubcategory[] = result[0]?.subcategories || [];
      const total: number = result[0]?.total[0]?.count || 0;

      logger.info(`Fetched ${subcategories.length} subcategories (total: ${total})`);
      return { subcategories, total };
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error fetching subcategories`, err);
      throw new RepositoryError(
        "Failed to fetch subcategories",
        StatusCodes.INTERNAL_SERVER_ERROR,
        err
      );
    }
  };

   getSubcategoryById = async(id: string): Promise<ISubcategory | null> =>{
    try {
      logger.debug(`Fetching subcategory by ID: ${id}`);
      const subcategory = await this.model
        .findById(id)
        .populate("categoryId")
        .exec();
      if (!subcategory) {
        logger.warn(`Subcategory not not found: ${id}`);
        throw new RepositoryError(`Subcategory not found with ID: ${id}`, StatusCodes.NOT_FOUND);
      }
        logger.info(`Subcategory fetched: ${id} (${subcategory.name})`);
      return subcategory;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error fetching subcategory by ID ${id}`, err);
      throw new RepositoryError('Error fetching subcategory by ID', StatusCodes.INTERNAL_SERVER_ERROR, err);
    }
  }

   public updateSubcategory = async(
    id: string,
    data: Partial<ISubcategory>
  ): Promise<ISubcategory | null> =>{
    try {
      logger.debug(`Updating subcategory: ${id}`);
      const subcategory = await this.findByIdAndUpdate(id, data, { new: true });
      if (!subcategory) {
        logger.warn(`Subcategory not not found: ${id}`);
        throw new RepositoryError(`Subcategory not found with ID: ${id}`, StatusCodes.NOT_FOUND);
      }
        logger.info(`Subcategory updated: ${id} (${subcategory.name})`);
      return subcategory;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error updating subcategory ${id}`, err);
      throw new RepositoryError('Error updating subcategory', StatusCodes.INTERNAL_SERVER_ERROR, err);
    }
  }

   public deleteSubcategory = async(id: string): Promise<ISubcategory | null> =>{
    try {
      logger.debug(`Deleting subcategory: ${id}`);
      const subcategory = await this.findByIdAndDelete(id);
      if (!subcategory) {
        logger.warn(`Subcategory not not found: ${id}`);
        throw new RepositoryError(`Subcategory not found with ID: ${id}`, StatusCodes.NOT_FOUND);
      }
        logger.info(`Subcategory deleted: ${id} (${subcategory.name})`);
      return subcategory;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error deleting subcategory ${id}`, err);
      throw new RepositoryError('Error deleting subcategory', StatusCodes.INTERNAL_SERVER_ERROR, err);
    }
  }

   deleteManySubcategories = async(
    categoryId: string
  ): Promise<{ deletedCount: number }> =>{
    try {
      logger.debug(`Deleting subcategories for category: ${categoryId}`);
      const result = await this.model.deleteMany({ categoryId }).exec();
      logger.info(`Deleted ${result.deletedCount} subcategories for category ${categoryId}`);
      return result;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error deleting subcategories for category ${categoryId}`, err);
      throw new RepositoryError('Error deleting subcategories', StatusCodes.INTERNAL_SERVER_ERROR, err);
    }
  }

  public isDuplicateSubcategory = async (name: string, categoryId: string, excludeId?: string): Promise<boolean> => {
    try {
      logger.debug(`Checking duplicate subcategory: ${name} for category: ${categoryId}${excludeId ? `, excluding ID: ${excludeId}` : ''}`);
      const query: any = { name, categoryId };
      if (excludeId) {
        query._id = { $ne: excludeId };
      }
      const existingSubcategory = await this.model.findOne(query).exec();
      const isDuplicate = !!existingSubcategory;
      logger.info(`Duplicate check for subcategory ${name} in category ${categoryId} - ${isDuplicate}`);
      return isDuplicate;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error checking duplicate subcategory ${name} for category ${categoryId}`, err);
      throw new RepositoryError('Error checking duplicate subcategory', StatusCodes.INTERNAL_SERVER_ERROR, err);
    }
  }
}
