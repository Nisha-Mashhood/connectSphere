import { BaseRepository } from "../../../core/Repositries/BaseRepositry.js";
import { RepositoryError } from "../../../core/Utils/ErrorHandler.js";
import logger from "../../../core/Utils/Logger.js";
import { Category } from "../../../models/category.model.js";
export class CategoryRepository extends BaseRepository {
    constructor() {
        super(Category);
    }
    async createCategory(data) {
        try {
            logger.debug(`Creating category: ${data.name}`);
            const category = await this.create(data);
            logger.info(`Category created: ${category._id} (${category.name})`);
            return category;
        }
        catch (error) {
            logger.error(`Error creating category: ${error}`);
            throw new RepositoryError(`Failed to create category: ${error}`);
        }
    }
    async getAllCategories() {
        try {
            logger.debug("Fetching all categories");
            const categories = await this.findAll();
            logger.info(`Fetched ${categories.length} categories`);
            return categories;
        }
        catch (error) {
            logger.error(`Error fetching categories: ${error}`);
            throw new RepositoryError(`Failed to fetch categories: ${error}`);
        }
    }
    async getCategoryById(id) {
        try {
            logger.debug(`Fetching category by ID: ${id}`);
            const category = await this.findById(id);
            if (!category) {
                logger.warn(`Category not found: ${id}`);
            }
            else {
                logger.info(`Category fetched: ${id} (${category.name})`);
            }
            return category;
        }
        catch (error) {
            logger.error(`Error fetching category by ID ${id}: ${error}`);
            throw new RepositoryError(`Failed to fetch category: ${error}`);
        }
    }
    async updateCategory(id, data) {
        try {
            logger.debug(`Updating category: ${id}`);
            const category = await this.findByIdAndUpdate(id, data, { new: true });
            if (!category) {
                logger.warn(`Category not found for update: ${id}`);
            }
            else {
                logger.info(`Category updated: ${id} (${category.name})`);
            }
            return category;
        }
        catch (error) {
            logger.error(`Error updating category ${id}: ${error}`);
            throw new RepositoryError(`Failed to update category: ${error}`);
        }
    }
    async deleteCategory(id) {
        try {
            logger.debug(`Deleting category: ${id}`);
            const category = await this.findByIdAndDelete(id);
            if (!category) {
                logger.warn(`Category not found for deletion: ${id}`);
            }
            else {
                logger.info(`Category deleted: ${id} (${category.name})`);
            }
            return category;
        }
        catch (error) {
            logger.error(`Error deleting category ${id}: ${error}`);
            throw new RepositoryError(`Failed to delete category: ${error}`);
        }
    }
    async isDuplicateCategoryName(name, excludeId) {
        try {
            logger.debug(`Checking duplicate category name: ${name}`);
            const filter = { name };
            if (excludeId) {
                filter._id = { $ne: excludeId };
            }
            const existingCategory = await this.findOne(filter);
            const isDuplicate = !!existingCategory;
            logger.info(`Duplicate check for category name ${name}: ${isDuplicate}`);
            return isDuplicate;
        }
        catch (error) {
            logger.error(`Error checking duplicate category name ${name}: ${error}`);
            throw new RepositoryError(`Failed to check duplicate category name: ${error}`);
        }
    }
}
//# sourceMappingURL=CategoryRepositry.js.map