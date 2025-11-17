import { inject, injectable } from "inversify";
import { ISkill } from "../Interfaces/Models/i-skill";
import logger from "../core/utils/logger";
import { uploadMedia } from "../core/utils/cloudinary";
import { ServiceError } from "../core/utils/error-handler";
import { ISkillsService } from "../Interfaces/Services/i-skills-service";
import { StatusCodes } from "../enums/status-code-enums";
import { ISkillsRepository } from "../Interfaces/Repository/i-skills-repositry";
import { ISkillDTO } from "../Interfaces/DTOs/i-skill-dto";
import { toSkillDTO, toSkillDTOs } from "../Utils/mappers/skill-mapper";

@injectable()
export class SkillsService implements ISkillsService {
  private _skillsRepository: ISkillsRepository;

  constructor(@inject('ISkillsRepository') skillRepository : ISkillsRepository) {
    this._skillsRepository = skillRepository;
  }

  createSkill = async (data: Partial<ISkill>, imagePath?: string, fileSize?: number): Promise<ISkillDTO> => {
    try {
      logger.debug(`Creating skill: ${data.name} for subcategory ${data.subcategoryId}`);

      if (!data.name || !data.subcategoryId) {
        logger.error("Missing required fields: name or subcategoryId");
        throw new ServiceError(
          "Skill name and subcategory ID are required",
          StatusCodes.BAD_REQUEST
        );
      }

      const isDuplicate = await this._skillsRepository.isDuplicateSkill(data.name, data.subcategoryId.toString());
      if (isDuplicate) {
        logger.warn(`Skill name '${data.name}' already exists in subcategory ${data.subcategoryId}`);
        throw new ServiceError(
          "Skill name already exists in this subcategory",
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
      const skillDTO = toSkillDTO(skill);
      if (!skillDTO) {
        logger.error(`Failed to map skill ${skill._id} to DTO`);
        throw new ServiceError(
          "Failed to map skill to DTO",
          StatusCodes.INTERNAL_SERVER_ERROR
        );
      }
      logger.info(`Skill created: ${skill._id} (${skill.name})`);
      return skillDTO;
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

  public getAllSkills = async (
    subcategoryId: string,
    query: { search?: string; page?: number; limit?: number } = {}
  ): Promise<{ skills: ISkillDTO[]; total: number }> => {
    try {
      logger.debug(`Service: Fetching skills for subcategory: ${subcategoryId}`);
      const result = await this._skillsRepository.getAllSkills(subcategoryId, query);
      const skillsDTO = toSkillDTOs(result.skills);
      return { skills: skillsDTO, total: result.total };
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error in SkillService: ${err.message}`);
      throw new ServiceError(
        "Failed to fetch skills",
        StatusCodes.INTERNAL_SERVER_ERROR,
        err
      );
    }
  };

  getSkillById = async (id: string): Promise<ISkillDTO | null> => {
    try {
      logger.debug(`Fetching skill: ${id}`);
      const skill = await this._skillsRepository.getSkillById(id);
      if (!skill) {
        logger.warn(`Skill not found: ${id}`);
        throw new ServiceError("Skill not found", StatusCodes.NOT_FOUND);
      }

      const skillDTO = toSkillDTO(skill);
      if (!skillDTO) {
        logger.error(`Failed to map skill ${id} to DTO`);
        throw new ServiceError(
          "Failed to map skill to DTO",
          StatusCodes.INTERNAL_SERVER_ERROR
        );
      }
      logger.info(`Skill fetched: ${id} (${skill.name})`);
      return skillDTO;
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
  ): Promise<ISkillDTO | null> => {
    try {
      logger.debug(`Updating skill: ${id}`);
      if (data.name) {
        const existingSkill = await this._skillsRepository.getSkillById(id);
        if (!existingSkill) {
          logger.warn(`Skill not found for update: ${id}`);
          throw new ServiceError("Skill not found", StatusCodes.NOT_FOUND);
        }
        const isDuplicate = await this._skillsRepository.isDuplicateSkill(
          data.name,
          existingSkill.subcategoryId._id.toString(),
          id
        );
        if (isDuplicate) {
          logger.warn(`Skill name '${data.name}' already exists in subcategory ${existingSkill.subcategoryId}`);
          throw new ServiceError(
            "Skill name already exists in this subcategory",
            StatusCodes.BAD_REQUEST
          );
        }
      }
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

      const skillDTO = toSkillDTO(skill);
      if (!skillDTO) {
        logger.error(`Failed to map skill ${id} to DTO`);
        throw new ServiceError(
          "Failed to map skill to DTO",
          StatusCodes.INTERNAL_SERVER_ERROR
        );
      }
      logger.info(`Skill updated: ${id} (${skill.name})`);
      return skillDTO;
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

  deleteSkill = async (id: string): Promise<ISkillDTO | null> => {
    try {
      logger.debug(`Deleting skill: ${id}`);

      const skill = await this._skillsRepository.deleteSkill(id);
      if (!skill) {
        logger.warn(`Skill not found for deletion: ${id}`);
        throw new ServiceError("Skill not found", StatusCodes.NOT_FOUND);
      }

      const skillDTO = toSkillDTO(skill);
      if (!skillDTO) {
        logger.error(`Failed to map skill ${id} to DTO`);
        throw new ServiceError(
          "Failed to map skill to DTO",
          StatusCodes.INTERNAL_SERVER_ERROR
        );
      }
      logger.info(`Skill deleted: ${id} (${skill.name})`);
      return skillDTO;
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