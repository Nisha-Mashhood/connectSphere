import { Request, Response, NextFunction } from "express";
import { inject, injectable } from "inversify";
import logger from "../core/Utils/Logger";
import { IAdminController } from "../Interfaces/Controller/i-admin-controller";
import { BaseController } from "../core/Controller/base-controller";
import { IAdminService } from "../Interfaces/Services/i-admin-service";
import { ADMIN_MESSAGES } from "../constants/messages";

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
      this.sendSuccess(res, { totalUsers: count }, ADMIN_MESSAGES.TOTAL_USERS);
    } catch (error: any) {
      logger.info(error);
      next(error);
    }
  };

  getTotalMentorsCount = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const count = await this._adminService.getTotalMentorsCount();
      this.sendSuccess(res, { totalMentors: count }, ADMIN_MESSAGES.TOTAL_MENTORS);
    } catch (error: any) {
      logger.info(error);
      next(error);
    }
  };

  getTotalRevenue = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const revenue = await this._adminService.getTotalRevenue();
      this.sendSuccess(res, revenue, ADMIN_MESSAGES.TOTAL_REVENUE);
    } catch (error: any) {
      logger.info(error);
      next(error);
    }
  };

  getPendingMentorRequestsCount = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const count = await this._adminService.getPendingMentorRequestsCount();
      this.sendSuccess(res, { pendingMentorRequests: count }, ADMIN_MESSAGES.PENDING_MENTOR_REQUESTS);
    } catch (error: any) {
      logger.info(error);
      next(error);
    }
  };

  getActiveCollaborationsCount = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const count = await this._adminService.getActiveCollaborationsCount();
      this.sendSuccess(res, { activeCollaborations: count }, ADMIN_MESSAGES.ACTIVE_COLLABORATIONS);
    } catch (error: any) {
      logger.info(error);
      next(error);
    }
  };

  getRevenueTrends = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { timeFormat, days } = req.query;
      const trends = await this._adminService.getRevenueTrends(timeFormat as string, Number(days));
      this.sendSuccess(res, trends, ADMIN_MESSAGES.REVENUE_TRENDS);
    } catch (error: any) {
      logger.info(error);
      next(error);
    }
  };

  getUserGrowth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { timeFormat, days } = req.query;
      const growth = await this._adminService.getUserGrowth(timeFormat as string, Number(days));
      this.sendSuccess(res, growth, ADMIN_MESSAGES.USER_GROWTH);
    } catch (error: any) {
      logger.info(error);
      next(error);
    }
  };

  getPendingMentorRequests = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { limit } = req.query;
      const requests = await this._adminService.getPendingMentorRequests(Number(limit));
      this.sendSuccess(res, requests, ADMIN_MESSAGES.PENDING_REQUESTS);
    } catch (error: any) {
      logger.info(error);
      next(error);
    }
  };

  getTopMentors = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { limit } = req.query;
      const mentors = await this._adminService.getTopMentors(Number(limit));
      this.sendSuccess(res, mentors, ADMIN_MESSAGES.TOP_MENTORS);
    } catch (error: any) {
      logger.info(error);
      next(error);
    }
  };

  getRecentCollaborations = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { limit } = req.query;
      const collaborations = await this._adminService.getRecentCollaborations(Number(limit));
      this.sendSuccess(res, collaborations, ADMIN_MESSAGES.RECENT_COLLABORATIONS);
    } catch (error: any) {
      logger.info(error);
      next(error);
    }
  };
}
