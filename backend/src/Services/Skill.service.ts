import { inject, injectable } from "inversify";
import { ISkill } from "../Interfaces/Models/ISkill";
import logger from "../Core/Utils/Logger";
import { uploadMedia } from "../Core/Utils/Cloudinary";
import { ServiceError } from "../Core/Utils/ErrorHandler";
import { ISkillsService } from "../Interfaces/Services/ISkillsService";
import { StatusCodes } from "../Enums/StatusCode.constants";
import { ISkillsRepository } from "../Interfaces/Repository/ISkillsRepository";

@injectable()
export class SkillsService implements ISkillsService {
  private _skillsRepository: ISkillsRepository;

  constructor(@inject('ISkillsRepository') skillRepository : ISkillsRepository) {
    this._skillsRepository = skillRepository;
  }

  createSkill = async (data: Partial<ISkill>, imagePath?: string, fileSize?: number): Promise<ISkill> => {
    try {
      logger.debug(`Creating skill: ${data.name} for subcategory ${data.subcategoryId}`);

      if (!data.name || !data.subcategoryId) {
        logger.error("Missing required fields: name or subcategoryId");
        throw new ServiceError(
          "Skill name and subcategory ID are required",
          StatusCodes.BAD_REQUEST
        );
      }
      let imageUrl: string | null = null;
      if (imagePath) {
        const folder = "skills";
        const { url } = await uploadMedia(imagePath, folder, fileSize);
        imageUrl = url;
        logger.info(`Uploaded image for skill: ${imageUrl}`);
      }

      const skill = await this._skillsRepository.createSkill({ ...data, imageUrl });
      logger.info(`Skill created: ${skill._id} (${skill.name})`);
      return skill;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error creating skill ${data.name}: ${err.message}`);
      throw error instanceof ServiceError
        ? error
        : new ServiceError(
            "Failed to create skill",
            StatusCodes.INTERNAL_SERVER_ERROR,
            err
          );
    }
  };

  getAllSkills = async (subcategoryId: string): Promise<ISkill[]> => {
    try {
      logger.debug(`Fetching skills for subcategory: ${subcategoryId}`);
      const skills = await this._skillsRepository.getAllSkills(subcategoryId);
      logger.info(`Fetched ${skills.length} skills for subcategory: ${subcategoryId}`);
      return skills;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error fetching skills for subcategory ${subcategoryId}: ${err.message}`);
      throw error instanceof ServiceError
        ? error
        : new ServiceError(
            "Failed to fetch skills",
            StatusCodes.INTERNAL_SERVER_ERROR,
            err
          );
    }
  };

  getSkillById = async (id: string): Promise<ISkill | null> => {
    try {
      logger.debug(`Fetching skill: ${id}`);
      const skill = await this._skillsRepository.getSkillById(id);
      if (!skill) {
        logger.warn(`Skill not found: ${id}`);
        throw new ServiceError("Skill not found", StatusCodes.NOT_FOUND);
      }

      logger.info(`Skill fetched: ${id} (${skill.name})`);
      return skill;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error fetching skill ${id}: ${err.message}`);
      throw error instanceof ServiceError
        ? error
        : new ServiceError(
            "Failed to fetch skill",
            StatusCodes.INTERNAL_SERVER_ERROR,
            err
          );
    }
  };

  updateSkill = async (
    id: string,
    data: Partial<ISkill>,
    imagePath?: string,
    fileSize?: number
  ): Promise<ISkill | null> => {
    try {
      logger.debug(`Updating skill: ${id}`);
      let imageUrl: string | null = null;
      if (imagePath) {
        const folder = "skills";
        const { url } = await uploadMedia(imagePath, folder, fileSize);
        imageUrl = url;
        logger.info(`Uploaded image for skill: ${imageUrl}`);
      }

      const skill = await this._skillsRepository.updateSkill(id, { ...data, ...(imageUrl && { imageUrl }) });
      if (!skill) {
        logger.warn(`Skill not found for update: ${id}`);
        throw new ServiceError("Skill not found", StatusCodes.NOT_FOUND);
      }

      logger.info(`Skill updated: ${id} (${skill.name})`);
      return skill;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error updating skill ${id}: ${err.message}`);
      throw error instanceof ServiceError
        ? error
        : new ServiceError(
            "Failed to update skill",
            StatusCodes.INTERNAL_SERVER_ERROR,
            err
          );
    }
  };

  deleteSkill = async (id: string): Promise<ISkill | null> => {
    try {
      logger.debug(`Deleting skill: ${id}`);

      const skill = await this._skillsRepository.deleteSkill(id);
      if (!skill) {
        logger.warn(`Skill not found for deletion: ${id}`);
        throw new ServiceError("Skill not found", StatusCodes.NOT_FOUND);
      }

      logger.info(`Skill deleted: ${id} (${skill.name})`);
      return skill;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error deleting skill ${id}: ${err.message}`);
      throw error instanceof ServiceError
        ? error
        : new ServiceError(
            "Failed to delete skill",
            StatusCodes.INTERNAL_SERVER_ERROR,
            err
          )
    }
  }

  getSkills = async (): Promise<{ _id: string; name: string }[]> => {
    try {
      logger.debug("Fetching all skills (name and ID only)");
      const skills = await this._skillsRepository.getSkills();
      logger.info(`Fetched ${skills.length} skills`);
      return skills;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error fetching skills: ${err.message}`);
      throw error instanceof ServiceError
        ? error
        : new ServiceError(
            "Failed to fetch skills",
            StatusCodes.INTERNAL_SERVER_ERROR,
            err
          );
    }
  }
}