import { BaseService } from "../../../core/Services/BaseService.js";
import { SkillsRepository } from "../../Skills/Repositry/SkillsRepositry.js";
import { SubcategoryRepository } from "../Repositry/SubCategoryRepositry.js";
import logger from "../../../core/Utils/Logger.js";
import { uploadMedia } from "../../../core/Utils/Cloudinary.js";
import { ServiceError } from "../../../core/Utils/ErrorHandler.js";
export class SubcategoryService extends BaseService {
    subcategoryRepo;
    skillsRepo;
    constructor() {
        super();
        this.subcategoryRepo = new SubcategoryRepository();
        this.skillsRepo = new SkillsRepository();
    }
    createSubcategory = async (data, imagePath, fileSize) => {
        try {
            this.checkData(data);
            logger.debug(`Creating subcategory: ${data.name} for category ${data.categoryId}`);
            let imageUrl = null;
            if (imagePath) {
                const folder = 'sub-categories';
                const { url } = await uploadMedia(imagePath, folder, fileSize);
                imageUrl = url;
                logger.info(`Uploaded image for subcategory: ${imageUrl}`);
            }
            const subcategory = await this.subcategoryRepo.createSubcategory({ ...data, imageUrl });
            logger.info(`Subcategory created: ${subcategory._id} (${subcategory.name})`);
            return subcategory;
        }
        catch (error) {
            logger.error(`Error creating subcategory: ${error}`);
            throw new ServiceError(`Failed to create subcategory: ${error}`);
        }
    };
    getAllSubcategories = async (categoryId) => {
        try {
            logger.debug(`Fetching subcategories for category: ${categoryId}`);
            const subcategories = await this.subcategoryRepo.getAllSubcategories(categoryId);
            logger.info(`Fetched ${subcategories.length} subcategories`);
            return subcategories;
        }
        catch (error) {
            logger.error(`Error fetching subcategories for category ${categoryId}: ${error}`);
            throw new ServiceError(`Failed to fetch subcategories: ${error}`);
        }
    };
    getSubcategoryById = async (id) => {
        try {
            logger.debug(`Fetching subcategory: ${id}`);
            const subcategory = await this.subcategoryRepo.getSubcategoryById(id);
            if (!subcategory) {
                logger.warn(`Subcategory not found: ${id}`);
            }
            else {
                logger.info(`Subcategory fetched: ${id} (${subcategory.name})`);
            }
            return subcategory;
        }
        catch (error) {
            logger.error(`Error fetching subcategory ${id}: ${error}`);
            throw new ServiceError(`Failed to fetch subcategory: ${error}`);
        }
    };
    updateSubcategory = async (id, data, imagePath, fileSize) => {
        try {
            this.checkData(data);
            logger.debug(`Updating subcategory: ${id}`);
            let imageUrl = null;
            if (imagePath) {
                const folder = 'sub-categories';
                const { url } = await uploadMedia(imagePath, folder, fileSize);
                imageUrl = url;
                logger.info(`Uploaded image for subcategory: ${imageUrl}`);
            }
            const subcategory = await this.subcategoryRepo.updateSubcategory(id, { ...data, ...(imageUrl && { imageUrl }) });
            if (!subcategory) {
                logger.warn(`Subcategory not found for update: ${id}`);
                this.throwError(`Subcategory not found: ${id}`);
            }
            logger.info(`Subcategory updated: ${id} (${subcategory?.name})`);
            return subcategory;
        }
        catch (error) {
            logger.error(`Error updating subcategory ${id}: ${error}`);
            throw new ServiceError(`Failed to update subcategory: ${error}`);
        }
    };
    deleteSubcategory = async (id) => {
        try {
            logger.debug(`Deleting subcategory: ${id}`);
            await this.skillsRepo.deleteManySkillsBySubcategoryId(id);
            logger.info(`Deleted skills for subcategory: ${id}`);
            const subcategory = await this.subcategoryRepo.deleteSubcategory(id);
            if (!subcategory) {
                logger.warn(`Subcategory not found for deletion: ${id}`);
                this.throwError(`Subcategory not found: ${id}`);
            }
            logger.info(`Subcategory deleted: ${id} (${subcategory?.name})`);
            return subcategory;
        }
        catch (error) {
            logger.error(`Error deleting subcategory ${id}: ${error}`);
            throw new ServiceError(`Failed to delete subcategory and related data: ${error}`);
        }
    };
}
//# sourceMappingURL=SubCategoryService.js.map