import { NextFunction, Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { BaseController } from '../core/controller/base-controller';
import logger from "../core/utils/logger";
import { ISkillsController } from '../Interfaces/Controller/i-skills-controller';
import { HttpError } from '../core/utils/error-handler';
import { ISkillsService } from '../Interfaces/Services/i-skills-service';
import { ISkill } from "../Interfaces/Models/i-skill";
import { SKILL_MESSAGES } from '../constants/messages';
import { ERROR_MESSAGES } from '../constants/error-messages';
import { StatusCodes } from '../enums/status-code-enums';

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

   createSkill = async (req: SkillRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      logger.debug(`Creating skill: ${req.body.name}`);
      const imagePath = req.file?.path;
      const fileSize = req.file?.size;
      const skill = await this._skillsService.createSkill(req.body, imagePath, fileSize);
      this.sendCreated(res, skill, SKILL_MESSAGES.SKILL_CREATED);
    } catch (error) {
      next(error);
    }
  };

  getAllSkills = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { subcategoryId } = req.params;
      const { search, page, limit } = req.query;

      const query: any = {};
      if (search) query.search = search as string;
      if (page) query.page = parseInt(page as string, 10);
      if (limit) query.limit = parseInt(limit as string, 10);

      const result = await this._skillsService.getAllSkills(subcategoryId!, query);

      if (result.skills.length === 0) {
        this.sendSuccess(
          res,
          { skills: [], total: 0, page: query.page || 1, limit: query.limit || 10 },
          query.search
            ? SKILL_MESSAGES.NO_SKILLS_FOUND
            : SKILL_MESSAGES.NO_SKILLS_FOUND_FOR_SUBCATEGORY
        );
        return;
      }

      this.sendSuccess(res, {
        skills: result.skills,
        total: result.total,
        page: query.page || 1,
        limit: query.limit || 10,
      }, SKILL_MESSAGES.SKILLS_FETCHED);
    } catch (error) {
      next(error);
    }
  };


  getSkillById = async (req: SkillRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      logger.debug(`Fetching skill: ${req.params.id}`);
      const skill = await this._skillsService.getSkillById(req.params.id!);
      if (!skill) {
        this.sendSuccess(res, "", SKILL_MESSAGES.NO_SKILLS_FOUND);
        logger.info("No skills found");
        return;
      }
      this.sendSuccess(res, skill, SKILL_MESSAGES.SKILL_FETCHED);
    } catch (error) {
      next(error);
    }
  };

  updateSkill = async (req: SkillRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      logger.debug(`Updating skill: ${req.params.id}`);
      const imagePath = req.file?.path;
      const fileSize = req.file?.size;
      const updatedSkill = await this._skillsService.updateSkill(req.params.id!, req.body, imagePath, fileSize);
      if (!updatedSkill) {
        throw new HttpError(ERROR_MESSAGES.SKILL_NOT_FOUND, StatusCodes.NOT_FOUND);
      }
      this.sendSuccess(res, updatedSkill, SKILL_MESSAGES.SKILL_UPDATED);
    } catch (error) {
      next(error);
    }
  };

  deleteSkill = async (req: SkillRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      logger.debug(`Deleting skill: ${req.params.id}`);
      const deletedSkill = await this._skillsService.deleteSkill(req.params.id!);
      if (!deletedSkill) {
        throw new HttpError(ERROR_MESSAGES.SKILL_NOT_FOUND, StatusCodes.NOT_FOUND);
      }
      this.sendNoContent(res, SKILL_MESSAGES.SKILL_DELETED);
    } catch (error) {
      next(error);
    }
  };

  getSkills = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      logger.debug("Fetching all skills (name and ID only)");
      const skills = await this._skillsService.getSkills();
      if (skills.length === 0) {
        this.sendSuccess(res, [], SKILL_MESSAGES.NO_SKILLS_FOUND);
        logger.info("No skills found");
        return;
      }
      this.sendSuccess(res, skills, SKILL_MESSAGES.SKILLS_FETCHED);
    } catch (error) {
      logger.error(`Error fetching skills: ${error}`);
      next(error);
    }
  };
}