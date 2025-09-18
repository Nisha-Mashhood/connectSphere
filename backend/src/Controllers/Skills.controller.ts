import { NextFunction, Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { BaseController } from '../Core/Controller/BaseController';
import logger from "../Core/Utils/Logger";
import { ISkillsController } from '../Interfaces/Controller/ISkillsController';
import { HttpError } from '../Core/Utils/ErrorHandler';
import { ISkillsService } from '../Interfaces/Services/ISkillsService';
import { ISkill } from "../Interfaces/Models/ISkill";

export interface SkillRequest extends Request {
  body: Partial<ISkill>;
  params: { id?: string; subcategoryId?: string };
}

@injectable()
export class SkillsController extends BaseController implements ISkillsController{
  private _skillsService: ISkillsService;

  constructor(
    @inject('ISkillsService') skillService : ISkillsService,
  ) {
    super();
    this._skillsService = skillService;
  }

   createSkill  = async(req: SkillRequest, res: Response, next:NextFunction): Promise<void> => {
    try {
      logger.debug(`Creating skill: ${req.body.name}`);
      const imagePath = req.file?.path;
      const fileSize = req.file?.size;
      const skill = await this._skillsService.createSkill(req.body, imagePath, fileSize);
      this.sendCreated(res, skill, 'Skill created successfully');
    } catch (error) {
      next(error)
    }
  }

   getAllSkills  = async(req: SkillRequest, res: Response, next:NextFunction): Promise<void> => {
    try {
      logger.debug(`Fetching skills for subcategory: ${req.params.subcategoryId}`);
      const skills = await this._skillsService.getAllSkills(req.params.subcategoryId!);
      if (skills.length === 0) {
        this.sendSuccess(res, [], 'No skills found for this subcategory');
        logger.info(`No skills found for subcategory: ${req.params.subcategoryId}`);
        return;
      }
      this.sendSuccess(res, skills, 'Skills fetched successfully');
    } catch (error) {
      next(error)
    }
  }

   getSkillById  = async(req: SkillRequest, res: Response, next:NextFunction): Promise<void> => {
    try {
      logger.debug(`Fetching skill: ${req.params.id}`);
      const skill = await this._skillsService.getSkillById(req.params.id!);
      if (!skill) {
        this.sendSuccess(res, '', 'No skills found');
        logger.info('No skills found');
        return;
      }
      this.sendSuccess(res, skill, 'Skill fetched successfully');
    } catch (error) {
      next(error)
    }
  }

   updateSkill  = async(req: SkillRequest, res: Response, next:NextFunction): Promise<void> => {
    try {
      logger.debug(`Updating skill: ${req.params.id}`);
      const imagePath = req.file?.path;
      const fileSize = req.file?.size;
      const updatedSkill = await this._skillsService.updateSkill(req.params.id!, req.body, imagePath, fileSize);
      if (!updatedSkill) {
        throw new HttpError('Skill not found', 404);
      }
      this.sendSuccess(res, updatedSkill, 'Skill updated successfully');
    } catch (error) {
      next(error)
    }
  }

   deleteSkill  = async(req: SkillRequest, res: Response, next:NextFunction): Promise<void> => {
    try {
      logger.debug(`Deleting skill: ${req.params.id}`);
      const deletedSkill = await this._skillsService.deleteSkill(req.params.id!);
      if (!deletedSkill) {
        throw new HttpError('Skill not found', 404);
      }
      this.sendNoContent(res, 'Skill deleted successfully');
    } catch (error) {
      next(error)
    }
  }

   getSkills = async(_req: Request, res: Response, next:NextFunction): Promise<void> => {
    try {
      logger.debug('Fetching all skills (name and ID only)');
      const skills = await this._skillsService.getSkills();
      if (skills.length === 0) {
        this.sendSuccess(res, [], 'No skills found');
        logger.info('No skills found');
        return;
      }
      this.sendSuccess(res, skills, 'Skills fetched successfully');
    } catch (error) {
      logger.error(`Error fetching skills: ${error}`);
      next(error)
    }
  }
}