import { BaseService } from "../../../core/Services/BaseService.js";
import { SkillsRepository } from "../Repositry/SkillsRepositry.js";
import { SkillInterface as ISkill } from "../../../Interfaces/models/SkillInterface.js";
import logger from "../../../core/Utils/Logger.js";
import { uploadMedia } from "../../../core/Utils/Cloudinary.js";
import { ServiceError } from "../../../core/Utils/ErrorHandler.js";

export class SkillsService extends BaseService {
  private skillsRepo: SkillsRepository;

  constructor() {
    super();
    this.skillsRepo = new SkillsRepository();
  }

   createSkill = async(data: Partial<ISkill>, imagePath?: string, fileSize?: number): Promise<ISkill> =>{
    try {
      this.checkData(data);
      logger.debug(`Creating skill: ${data.name} for subcategory ${data.subcategoryId}`);
      let imageUrl: string | null = null;
      if (imagePath) {
        const folder = 'skills';
        const { url } = await uploadMedia(imagePath, folder, fileSize);
        imageUrl = url;
        logger.info(`Uploaded image for skill: ${imageUrl}`);
      }
      const skill = await this.skillsRepo.createSkill({ ...data, imageUrl });
      logger.info(`Skill created: ${skill._id} (${skill.name})`);
      return skill;
    } catch (error) {
      logger.error(`Error creating skill: ${error}`);
      throw new ServiceError(`Failed to create skill: ${error}`);
    }
  }

   getAllSkills = async(subcategoryId: string): Promise<ISkill[]> =>{
    try {
      logger.debug(`Fetching skills for subcategory: ${subcategoryId}`);
      const skills = await this.skillsRepo.getAllSkills(subcategoryId);
      logger.info(`Fetched ${skills.length} skills`);
      return skills;
    } catch (error) {
      logger.error(`Error fetching skills for subcategory ${subcategoryId}: ${error}`);
      throw new ServiceError(`Failed to fetch skills: ${error}`);
    }
  }

   getSkillById = async(id: string): Promise<ISkill | null> =>{
    try {
      logger.debug(`Fetching skill: ${id}`);
      const skill = await this.skillsRepo.getSkillById(id);
      if (!skill) {
        logger.warn(`Skill not found: ${id}`);
      } else {
        logger.info(`Skill fetched: ${id} (${skill.name})`);
      }
      return skill;
    } catch (error) {
      logger.error(`Error fetching skill ${id}: ${error}`);
      throw new ServiceError(`Failed to fetch skill: ${error}`);
    }
  }

   updateSkill = async(id: string, data: Partial<ISkill>, imagePath?: string, fileSize?: number): Promise<ISkill | null> =>{
    try {
      this.checkData(data);
      logger.debug(`Updating skill: ${id}`);
      let imageUrl: string | null = null;
      if (imagePath) {
        const folder = 'skills';
        const { url } = await uploadMedia(imagePath, folder, fileSize);
        imageUrl = url;
        logger.info(`Uploaded image for skill: ${imageUrl}`);
      }
      const skill = await this.skillsRepo.updateSkill(id, { ...data, ...(imageUrl && { imageUrl }) });
      if (!skill) {
        logger.warn(`Skill not found for update: ${id}`);
        this.throwError(`Skill not found: ${id}`);
      }
      logger.info(`Skill updated: ${id} (${skill?.name})`);
      return skill;
    } catch (error) {
      logger.error(`Error updating skill ${id}: ${error}`);
      throw new ServiceError(`Failed to update skill: ${error}`);
    }
  }

   deleteSkill = async(id: string): Promise<ISkill | null> => {
    try {
      logger.debug(`Deleting skill: ${id}`);
      const skill = await this.skillsRepo.deleteSkill(id);
      if (!skill) {
        logger.warn(`Skill not found for deletion: ${id}`);
        this.throwError(`Skill not found: ${id}`);
      }
      logger.info(`Skill deleted: ${id} (${skill?.name})`);
      return skill;
    } catch (error) {
      logger.error(`Error deleting skill ${id}: ${error}`);
      throw new ServiceError(`Failed to delete skill: ${error}`);
    }
  }

   getSkills = async(): Promise<{ _id: string; name: string }[]> =>{
    try {
      logger.debug('Fetching all skills (name and ID only)');
      const skills = await this.skillsRepo.getSkills();
      logger.info(`Fetched ${skills.length} skills`);
      return skills;
    } catch (error) {
      logger.error(`Error fetching skills: ${error}`);
      throw new ServiceError(`Failed to fetch skills: ${error}`);
    }
  }
}