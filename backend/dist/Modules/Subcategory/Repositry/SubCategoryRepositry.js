import { BaseRepository } from "../../../core/Repositries/BaseRepositry.js";
import { RepositoryError } from "../../../core/Utils/ErrorHandler.js";
import logger from "../../../core/Utils/Logger.js";
import { Subcategory } from "../../../models/subcategory.model.js";
export class SubcategoryRepository extends BaseRepository {
    constructor() {
        super(Subcategory);
    }
    async createSubcategory(data) {
        try {
            logger.debug(`Creating subcategory: ${data.name} for category ${data.categoryId}`);
            const subcategory = await this.create(data);
            logger.info(`Subcategory created: ${subcategory._id} (${subcategory.name})`);
            return subcategory;
        }
        catch (error) {
            logger.error(`Error creating subcategory: ${error}`);
            throw new RepositoryError(`Failed to create subcategory: ${error}`);
        }
    }
    async getAllSubcategories(categoryId) {
        try {
            logger.debug(`Fetching subcategories for category: ${categoryId}`);
            const subcategories = await this.model
                .find({ categoryId })
                .populate("categoryId")
                .exec();
            logger.info(`Fetched ${subcategories.length} subcategories for category ${categoryId}`);
            return subcategories;
        }
        catch (error) {
            logger.error(`Error fetching subcategories for category ${categoryId}: ${error}`);
            throw new RepositoryError(`Failed to fetch subcategories: ${error}`);
        }
    }
    async getSubcategoryById(id) {
        try {
            logger.debug(`Fetching subcategory by ID: ${id}`);
            const subcategory = await this.model
                .findById(id)
                .populate("categoryId")
                .exec();
            if (!subcategory) {
                logger.warn(`Subcategory not found: ${id}`);
            }
            else {
                logger.info(`Subcategory fetched: ${id} (${subcategory.name})`);
            }
            return subcategory;
        }
        catch (error) {
            logger.error(`Error fetching subcategory by ID ${id}: ${error}`);
            throw new RepositoryError(`Failed to fetch subcategory: ${error}`);
        }
    }
    async updateSubcategory(id, data) {
        try {
            logger.debug(`Updating subcategory: ${id}`);
            const subcategory = await this.findByIdAndUpdate(id, data, { new: true });
            if (!subcategory) {
                logger.warn(`Subcategory not found for update: ${id}`);
            }
            else {
                logger.info(`Subcategory updated: ${id} (${subcategory.name})`);
            }
            return subcategory;
        }
        catch (error) {
            logger.error(`Error updating subcategory ${id}: ${error}`);
            throw new RepositoryError(`Failed to update subcategory: ${error}`);
        }
    }
    async deleteSubcategory(id) {
        try {
            logger.debug(`Deleting subcategory: ${id}`);
            const subcategory = await this.findByIdAndDelete(id);
            if (!subcategory) {
                logger.warn(`Subcategory not found for deletion: ${id}`);
            }
            else {
                logger.info(`Subcategory deleted: ${id} (${subcategory.name})`);
            }
            return subcategory;
        }
        catch (error) {
            logger.error(`Error deleting subcategory ${id}: ${error}`);
            throw new RepositoryError(`Failed to delete subcategory: ${error}`);
        }
    }
    async deleteManySubcategories(categoryId) {
        try {
            logger.debug(`Deleting subcategories for category: ${categoryId}`);
            const result = await this.model.deleteMany({ categoryId }).exec();
            logger.info(`Deleted ${result.deletedCount} subcategories for category ${categoryId}`);
            return result;
        }
        catch (error) {
            logger.error(`Error deleting subcategories for category ${categoryId}: ${error}`);
            throw new RepositoryError(`Failed to delete subcategories: ${error}`);
        }
    }
}
//# sourceMappingURL=SubCategoryRepositry.js.map