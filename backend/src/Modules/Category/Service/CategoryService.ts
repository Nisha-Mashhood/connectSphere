import { CategoryRepository } from '../Repositry/CategoryRepositry.js';
import { BaseService } from "../../../core/Services/BaseService.js";
import { SkillsRepository } from "../../Skills/Repositry/SkillsRepositry.js";
import { SubcategoryRepository } from "../../Subcategory/Repositry/SubCategoryRepositry.js";
import { CategoryInterface as ICategory } from "../../../Interfaces/models/CategoryInterface.js";
import logger from "../../../core/Utils/Logger.js";
import { uploadMedia } from "../../../core/Utils/Cloudinary.js";
import { ServiceError } from "../../../core/Utils/ErrorHandler.js";

export class CategoryService extends BaseService {
  private categoryRepo: CategoryRepository;
  private subcategoryRepo: SubcategoryRepository;
  private skillsRepo: SkillsRepository;

  constructor() {
    super();
    this.categoryRepo = new CategoryRepository();
    this.subcategoryRepo = new SubcategoryRepository();
    this.skillsRepo = new SkillsRepository();
  }

  async isDuplicateCategoryName(name: string, excludeId?: string): Promise<boolean> {
    try {
      logger.debug(`Checking duplicate category name: ${name}`);
      return await this.categoryRepo.isDuplicateCategoryName(name, excludeId);
    } catch (error) {
      logger.error(`Error checking duplicate category name ${name}: ${error}`);
      throw new ServiceError(`Failed to check duplicate category name: ${error}`);
    }
  }

  async createCategory(data: Partial<ICategory>, imagePath?: string, fileSize?: number): Promise<ICategory> {
    try {
      this.checkData(data);
      logger.debug(`Creating category with name: ${data.name}`);
      let imageUrl: string | null = null;
      if (imagePath) {
        const folder = 'categories';
        const { url } = await uploadMedia(imagePath, folder, fileSize);
        imageUrl = url;
        logger.info(`Uploaded image for category: ${imageUrl}`);
      }
      const category = await this.categoryRepo.createCategory({ ...data, imageUrl });
      logger.info(`Category created: ${category._id} (${category.name})`);
      return category;
    } catch (error) {
      logger.error(`Error creating category: ${error}`);
      throw new ServiceError(`Failed to create category: ${error}`);
    }
  }

  async getAllCategories(): Promise<ICategory[]> {
    try {
      logger.debug('Fetching all categories');
      const categories = await this.categoryRepo.getAllCategories();
      logger.info(`Fetched ${categories.length} categories`);
      return categories;
    } catch (error) {
      logger.error(`Error fetching categories: ${error}`);
      throw new ServiceError(`Failed to fetch categories: ${error}`);
    }
  }

  async getCategoryById(id: string): Promise<ICategory | null> {
    try {
      logger.debug(`Fetching category: ${id}`);
      const category = await this.categoryRepo.getCategoryById(id);
      if (!category) {
        logger.warn(`Category not found: ${id}`);
      } else {
        logger.info(`Category fetched: ${id} (${category.name})`);
      }
      return category;
    } catch (error) {
      logger.error(`Error fetching category ${id}: ${error}`);
      throw new ServiceError(`Failed to fetch category: ${error}`);
    }
  }

  async updateCategory(id: string, data: Partial<ICategory>, imagePath?: string, fileSize?: number): Promise<ICategory | null> {
    try {
      this.checkData(data);
      logger.debug(`Updating category: ${id}`);
      let imageUrl: string | null = null;
      if (imagePath) {
        const folder = 'categories';
        const { url } = await uploadMedia(imagePath, folder, fileSize);
        imageUrl = url;
        logger.info(`Uploaded image for category: ${imageUrl}`);
      }
      const category = await this.categoryRepo.updateCategory(id, { ...data, ...(imageUrl && { imageUrl }) });
      if (!category) {
        logger.warn(`Category not found for update: ${id}`);
        this.throwError(`Category not found: ${id}`);
      }
      logger.info(`Category updated: ${id} (${category?.name})`);
      return category;
    } catch (error) {
      logger.error(`Error updating category ${id}: ${error}`);
      throw new ServiceError(`Failed to update category: ${error}`);
    }
  }

  async deleteCategory(id: string): Promise<ICategory | null> {
    try {
      logger.debug(`Deleting category: ${id}`);
      await this.subcategoryRepo.deleteManySubcategories(id);
      logger.info(`Deleted subcategories for category: ${id}`);
      await this.skillsRepo.deleteManySkills(id);
      logger.info(`Deleted skills for category: ${id}`);
      const category = await this.categoryRepo.deleteCategory(id);
      if (!category) {
        logger.warn(`Category not found for deletion: ${id}`);
        this.throwError(`Category not found: ${id}`);
      }
      logger.info(`Category deleted: ${id} (${category?.name})`);
      return category;
    } catch (error) {
      logger.error(`Error deleting category ${id}: ${error}`);
      throw new ServiceError(`Failed to delete category and related data: ${error}`);
    }
  }
}