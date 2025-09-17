import { injectable } from "inversify";
import { ISkillsRepository } from "../Interfaces/Repository/ISkillsRepository";
import { BaseRepository } from "../Core/Repositries/BaseRepositry";
import { RepositoryError } from "../Core/Utils/ErrorHandler";
import logger from "../Core/Utils/Logger";
import { ISkill, } from "../Interfaces/Models/ISkill";
import { Skill } from "../Models/skills.model";
import { StatusCodes } from "../Enums/StatusCode.constants";
import { Model } from "mongoose";

@injectable()
export class SkillsRepository extends BaseRepository<ISkill> implements ISkillsRepository{
  constructor() {
    super(Skill as Model<ISkill>);
  }

   public createSkill = async(data: Partial<ISkill>): Promise<ISkill> =>{
    try {
      logger.debug(`Creating skill: ${data.name} for subcategory ${data.subcategoryId}`);
      const skill = await this.create(data);
      logger.info(`Skill created: ${skill._id} (${skill.name})`);
      return skill;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error creating skill ${data.name}`, err);
      throw new RepositoryError('Error creating skill', StatusCodes.INTERNAL_SERVER_ERROR, err);
    }
  }

   public getAllSkills = async(subcategoryId: string): Promise<ISkill[]> =>{
    try {
      logger.debug(`Fetching skills for subcategory: ${subcategoryId}`);
      const skills = await this.model
        .find({ subcategoryId })
        .populate("categoryId")
        .populate("subcategoryId")
        .exec();
      logger.info(`Fetched ${skills.length} skills for subcategory ${subcategoryId}`);
      return skills;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error fetching skills for subcategory ${subcategoryId}`, err);
      throw new RepositoryError('Error fetching skills', StatusCodes.INTERNAL_SERVER_ERROR, err);
    }
  }

   public getSkillById = async(id: string): Promise<ISkill | null> =>{
    try {
      logger.debug(`Fetching skill by ID: ${id}`);
      const skill = await this.model
        .findById(id)
        .populate("categoryId")
        .populate("subcategoryId")
        .exec();
      if (!skill) {
        logger.warn(`Skill not found: ${id}`);
        throw new RepositoryError(`Skill not found with ID: ${id}`, StatusCodes.NOT_FOUND);
      } else {
        logger.info(`Skill fetched: ${id} (${skill.name})`);
      }
      return skill;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error fetching skill by ID ${id}`, err);
      throw new RepositoryError('Error fetching skill by ID', StatusCodes.INTERNAL_SERVER_ERROR, err);
    }
  }

   public updateSkill = async(id: string, data: Partial<ISkill>): Promise<ISkill | null> =>{
    try {
      logger.debug(`Updating skill: ${id}`);
      const skill = await this.findByIdAndUpdate(id, data, { new: true });
      if (!skill) {
        logger.warn(`Skill not found: ${id}`);
        throw new RepositoryError(`Skill not found with ID: ${id}`, StatusCodes.NOT_FOUND);
      } else {
        logger.info(`Skill updated: ${id} (${skill.name})`);
      }
      return skill;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error updating skill ${id}`, err);
      throw new RepositoryError('Error updating skill', StatusCodes.INTERNAL_SERVER_ERROR, err);
    }
  }

   public deleteSkill = async(id: string): Promise<ISkill | null>=> {
    try {
      logger.debug(`Deleting skill: ${id}`);
      const skill = await this.findByIdAndDelete(id);
      if (!skill) {
        logger.warn(`Skill not found: ${id}`);
        throw new RepositoryError(`Skill not found with ID: ${id}`, StatusCodes.NOT_FOUND);
      } else {
        logger.info(`Skill deleted: ${id} (${skill.name})`);
      }
      return skill;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error deleting skill ${id}`, err);
      throw new RepositoryError('Error deleting skill', StatusCodes.INTERNAL_SERVER_ERROR, err);
    }
  }

   public deleteManySkills = async(
    categoryId: string
  ): Promise<{ deletedCount: number }> =>{
    try {
      logger.debug(`Deleting skills for category: ${categoryId}`);
      const result = await this.model.deleteMany({ categoryId }).exec();
      logger.info(`Deleted ${result.deletedCount} skills for category ${categoryId}`);
      return result;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error deleting skills for category ${categoryId}`, err);
      throw new RepositoryError('Error deleting skills', StatusCodes.INTERNAL_SERVER_ERROR, err);
    }
  }

   public deleteManySkillsBySubcategoryId = async(
    subcategoryId: string
  ): Promise<{ deletedCount: number }> =>{
    try {
      logger.debug(`Deleting skills for subcategory: ${subcategoryId}`);
      const result = await this.model.deleteMany({ subcategoryId }).exec();
      logger.info(`Deleted ${result.deletedCount} skills for subcategory ${subcategoryId}`);
      return result;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error deleting skills for subcategory ${subcategoryId}`, err);
      throw new RepositoryError('Error deleting skills', StatusCodes.INTERNAL_SERVER_ERROR, err);
    }
  }

   public getSkills = async(): Promise<{ _id: string; name: string }[]> =>{
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
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error fetching skills`, err);
      throw new RepositoryError('Error fetching skills', StatusCodes.INTERNAL_SERVER_ERROR, err);
    }
  }

  public isDuplicateSkill = async (name: string, subcategoryId: string): Promise<boolean> => {
    try {
      logger.debug(`Checking duplicate skill: ${name} for subcategory: ${subcategoryId}`);
      const existingSkill = await this.model
        .findOne({ name, subcategoryId: subcategoryId })
        .exec();
      const isDuplicate = !!existingSkill;
      logger.info(`Duplicate check for skill ${name} in subcategory ${subcategoryId} - ${isDuplicate}`);
      return isDuplicate;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error checking duplicate skill ${name} for subcategory ${subcategoryId}`, err);
      throw new RepositoryError('Error checking duplicate skill', StatusCodes.INTERNAL_SERVER_ERROR, err);
    }
  }
}
