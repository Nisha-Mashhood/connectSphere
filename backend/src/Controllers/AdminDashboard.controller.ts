import { Request, Response, NextFunction } from "express";
import { inject, injectable } from "inversify";
import logger from "../Core/Utils/Logger";
import { IAdminController } from "../Interfaces/Controller/IAdminController";
import { BaseController } from "../Core/Controller/BaseController";
import { IAdminService } from "../Interfaces/Services/IAdminService";

@injectable()
export class AdminController extends BaseController implements IAdminController {
  private _adminService: IAdminService;
    
  constructor(@inject('IAdminService') adminService : IAdminService) {
    super();
    this._adminService = adminService;
  }

  
  getTotalUsersCount = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const count = await this._adminService.getTotalUsersCount();
      this.sendSuccess(res, { totalUsers: count }, "Total users count retrieved successfully");
    } catch (error: any) {
      logger.info(error);
      next(error);
    }
  };

  getTotalMentorsCount = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const count = await this._adminService.getTotalMentorsCount();
      this.sendSuccess(res, { totalMentors: count }, "Total mentors count retrieved successfully");
    } catch (error: any) {
      logger.info(error);
      next(error);
    }
  };

  getTotalRevenue = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const revenue = await this._adminService.getTotalRevenue();
      this.sendSuccess(res, revenue, "Total revenue retrieved successfully");
    } catch (error: any) {
      logger.info(error);
      next(error);
    }
  };

  getPendingMentorRequestsCount = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const count = await this._adminService.getPendingMentorRequestsCount();
      this.sendSuccess(res, { pendingMentorRequests: count }, "Pending mentor requests count retrieved successfully");
    } catch (error: any) {
      logger.info(error);
      next(error);
    }
  };

  getActiveCollaborationsCount = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const count = await this._adminService.getActiveCollaborationsCount();
      this.sendSuccess(res, { activeCollaborations: count }, "Active collaborations count retrieved successfully");
    } catch (error: any) {
      logger.info(error);
      next(error);
    }
  };

  getRevenueTrends = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { timeFormat, days } = req.query;
      const trends = await this._adminService.getRevenueTrends(timeFormat as string, Number(days));
      this.sendSuccess(res, trends, "Revenue trends retrieved successfully");
    } catch (error: any) {
      logger.info(error);
      next(error);
    }
  };

  getUserGrowth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { timeFormat, days } = req.query;
      const growth = await this._adminService.getUserGrowth(timeFormat as string, Number(days));
      this.sendSuccess(res, growth, "User growth retrieved successfully");
    } catch (error: any) {
      logger.info(error);
      next(error);
    }
  };

  getPendingMentorRequests = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { limit } = req.query;
      const requests = await this._adminService.getPendingMentorRequests(Number(limit));
      this.sendSuccess(res, requests, "Pending mentor requests retrieved successfully");
    } catch (error: any) {
      logger.info(error);
      next(error);
    }
  };

  getTopMentors = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { limit } = req.query;
      const mentors = await this._adminService.getTopMentors(Number(limit));
      this.sendSuccess(res, mentors, "Top mentors retrieved successfully");
    } catch (error: any) {
      logger.info(error);
      next(error);
    }
  };

  getRecentCollaborations = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { limit } = req.query;
      const collaborations = await this._adminService.getRecentCollaborations(Number(limit));
      this.sendSuccess(res, collaborations, "Recent collaborations retrieved successfully");
    } catch (error: any) {
      logger.info(error);
      next(error);
    }
  };
}
