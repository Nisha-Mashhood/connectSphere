import { NextFunction, Request, Response } from "express";

export interface ISkillsController {
  createSkill(req: Request, res: Response, next:NextFunction): Promise<void>;
  getAllSkills(req: Request, res: Response, next:NextFunction): Promise<void>;
  getSkillById(req: Request, res: Response, next:NextFunction): Promise<void>;
  updateSkill(req: Request, res: Response, next:NextFunction): Promise<void>;
  deleteSkill(req: Request, res: Response, next:NextFunction): Promise<void>;
  getSkills(req: Request, res: Response, next:NextFunction): Promise<void>;
}