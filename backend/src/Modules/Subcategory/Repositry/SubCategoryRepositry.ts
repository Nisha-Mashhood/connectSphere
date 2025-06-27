import { BaseRepository } from "../../../core/Repositries/BaseRepositry";
import { RepositoryError } from "../../../core/Utils/ErrorHandler";
import logger from "../../../core/Utils/Logger";
import { SubcategoryInterface as ISubcategory } from "../../../Interfaces/models/SubcategoryInterface";
import { Subcategory } from "../../../models/subcategory.model";

export class SubcategoryRepository extends BaseRepository<ISubcategory> {
  constructor() {
    super(Subcategory);
  }

   createSubcategory = async(data: Partial<ISubcategory>): Promise<ISubcategory> => {
    try {
      logger.debug(
        `Creating subcategory: ${data.name} for category ${data.categoryId}`
      );
      const subcategory = await this.create(data);
      logger.info(
        `Subcategory created: ${subcategory._id} (${subcategory.name})`
      );
      return subcategory;
    } catch (error) {
      logger.error(`Error creating subcategory: ${error}`);
      throw new RepositoryError(`Failed to create subcategory: ${error}`);
    }
  }

   getAllSubcategories = async(categoryId: string): Promise<ISubcategory[]> =>{
    try {
      logger.debug(`Fetching subcategories for category: ${categoryId}`);
      const subcategories = await this.model
        .find({ categoryId })
        .populate("categoryId")
        .exec();
      logger.info(
        `Fetched ${subcategories.length} subcategories for category ${categoryId}`
      );
      return subcategories;
    } catch (error) {
      logger.error(
        `Error fetching subcategories for category ${categoryId}: ${error}`
      );
      throw new RepositoryError(`Failed to fetch subcategories: ${error}`);
    }
  }

   getSubcategoryById = async(id: string): Promise<ISubcategory | null> =>{
    try {
      logger.debug(`Fetching subcategory by ID: ${id}`);
      const subcategory = await this.model
        .findById(id)
        .populate("categoryId")
        .exec();
      if (!subcategory) {
        logger.warn(`Subcategory not found: ${id}`);
      } else {
        logger.info(`Subcategory fetched: ${id} (${subcategory.name})`);
      }
      return subcategory;
    } catch (error) {
      logger.error(`Error fetching subcategory by ID ${id}: ${error}`);
      throw new RepositoryError(`Failed to fetch subcategory: ${error}`);
    }
  }

   updateSubcategory = async(
    id: string,
    data: Partial<ISubcategory>
  ): Promise<ISubcategory | null> =>{
    try {
      logger.debug(`Updating subcategory: ${id}`);
      const subcategory = await this.findByIdAndUpdate(id, data, { new: true });
      if (!subcategory) {
        logger.warn(`Subcategory not found for update: ${id}`);
      } else {
        logger.info(`Subcategory updated: ${id} (${subcategory.name})`);
      }
      return subcategory;
    } catch (error) {
      logger.error(`Error updating subcategory ${id}: ${error}`);
      throw new RepositoryError(`Failed to update subcategory: ${error}`);
    }
  }

   deleteSubcategory = async(id: string): Promise<ISubcategory | null> =>{
    try {
      logger.debug(`Deleting subcategory: ${id}`);
      const subcategory = await this.findByIdAndDelete(id);
      if (!subcategory) {
        logger.warn(`Subcategory not found for deletion: ${id}`);
      } else {
        logger.info(`Subcategory deleted: ${id} (${subcategory.name})`);
      }
      return subcategory;
    } catch (error) {
      logger.error(`Error deleting subcategory ${id}: ${error}`);
      throw new RepositoryError(`Failed to delete subcategory: ${error}`);
    }
  }

   deleteManySubcategories = async(
    categoryId: string
  ): Promise<{ deletedCount: number }> =>{
    try {
      logger.debug(`Deleting subcategories for category: ${categoryId}`);
      const result = await this.model.deleteMany({ categoryId }).exec();
      logger.info(
        `Deleted ${result.deletedCount} subcategories for category ${categoryId}`
      );
      return result;
    } catch (error) {
      logger.error(
        `Error deleting subcategories for category ${categoryId}: ${error}`
      );
      throw new RepositoryError(`Failed to delete subcategories: ${error}`);
    }
  }
}
