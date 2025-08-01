import { BaseRepository } from "../../../core/Repositries/BaseRepositry.js";
import { RepositoryError } from "../../../core/Utils/ErrorHandler.js";
import logger from "../../../core/Utils/Logger.js";
import { Skill } from "../../../models/skills.model.js";
export class SkillsRepository extends BaseRepository {
    constructor() {
        super(Skill);
    }
    createSkill = async (data) => {
        try {
            logger.debug(`Creating skill: ${data.name} for subcategory ${data.subcategoryId}`);
            const skill = await this.create(data);
            logger.info(`Skill created: ${skill._id} (${skill.name})`);
            return skill;
        }
        catch (error) {
            logger.error(`Error creating skill: ${error}`);
            throw new RepositoryError(`Failed to create skill: ${error}`);
        }
    };
    getAllSkills = async (subcategoryId) => {
        try {
            logger.debug(`Fetching skills for subcategory: ${subcategoryId}`);
            const skills = await this.model
                .find({ subcategoryId })
                .populate("categoryId")
                .populate("subcategoryId")
                .exec();
            logger.info(`Fetched ${skills.length} skills for subcategory ${subcategoryId}`);
            return skills;
        }
        catch (error) {
            logger.error(`Error fetching skills for subcategory ${subcategoryId}: ${error}`);
            throw new RepositoryError(`Failed to fetch skills: ${error}`);
        }
    };
    getSkillById = async (id) => {
        try {
            logger.debug(`Fetching skill by ID: ${id}`);
            const skill = await this.model
                .findById(id)
                .populate("categoryId")
                .populate("subcategoryId")
                .exec();
            if (!skill) {
                logger.warn(`Skill not found: ${id}`);
            }
            else {
                logger.info(`Skill fetched: ${id} (${skill.name})`);
            }
            return skill;
        }
        catch (error) {
            logger.error(`Error fetching skill by ID ${id}: ${error}`);
            throw new RepositoryError(`Failed to fetch skill: ${error}`);
        }
    };
    updateSkill = async (id, data) => {
        try {
            logger.debug(`Updating skill: ${id}`);
            const skill = await this.findByIdAndUpdate(id, data, { new: true });
            if (!skill) {
                logger.warn(`Skill not found for update: ${id}`);
            }
            else {
                logger.info(`Skill updated: ${id} (${skill.name})`);
            }
            return skill;
        }
        catch (error) {
            logger.error(`Error updating skill ${id}: ${error}`);
            throw new RepositoryError(`Failed to update skill: ${error}`);
        }
    };
    deleteSkill = async (id) => {
        try {
            logger.debug(`Deleting skill: ${id}`);
            const skill = await this.findByIdAndDelete(id);
            if (!skill) {
                logger.warn(`Skill not found for deletion: ${id}`);
            }
            else {
                logger.info(`Skill deleted: ${id} (${skill.name})`);
            }
            return skill;
        }
        catch (error) {
            logger.error(`Error deleting skill ${id}: ${error}`);
            throw new RepositoryError(`Failed to delete skill: ${error}`);
        }
    };
    deleteManySkills = async (categoryId) => {
        try {
            logger.debug(`Deleting skills for category: ${categoryId}`);
            const result = await this.model.deleteMany({ categoryId }).exec();
            logger.info(`Deleted ${result.deletedCount} skills for category ${categoryId}`);
            return result;
        }
        catch (error) {
            logger.error(`Error deleting skills for category ${categoryId}: ${error}`);
            throw new RepositoryError(`Failed to delete skills: ${error}`);
        }
    };
    deleteManySkillsBySubcategoryId = async (subcategoryId) => {
        try {
            logger.debug(`Deleting skills for subcategory: ${subcategoryId}`);
            const result = await this.model.deleteMany({ subcategoryId }).exec();
            logger.info(`Deleted ${result.deletedCount} skills for subcategory ${subcategoryId}`);
            return result;
        }
        catch (error) {
            logger.error(`Error deleting skills for subcategory ${subcategoryId}: ${error}`);
            throw new RepositoryError(`Failed to delete skills: ${error}`);
        }
    };
    getSkills = async () => {
        try {
            logger.debug("Fetching all skills (name and ID only)");
            const skills = await this.model
                .find({}, { name: 1, _id: 1 })
                .lean()
                .exec();
            const result = skills.map((skill) => ({
                _id: skill._id.toString(),
                name: skill.name,
            }));
            logger.info(`Fetched ${result.length} skills`);
            return result;
        }
        catch (error) {
            logger.error(`Error fetching skills: ${error}`);
            throw new RepositoryError(`Failed to fetch skills: ${error}`);
        }
    };
}
//# sourceMappingURL=SkillsRepositry.js.map