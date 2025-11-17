import { Request, Response, NextFunction } from "express";
import { inject, injectable } from "inversify";
import logger from "../core/utils/logger";
import { IAdminController } from "../Interfaces/Controller/i-admin-controller";
import { BaseController } from "../core/controller/base-controller";
import { IAdminService } from "../Interfaces/Services/i-admin-service";
import { ADMIN_MESSAGES, AUTH_MESSAGES } from "../constants/messages";
import { ERROR_MESSAGES } from "../constants/error-messages";
import { StatusCodes } from "../enums/status-code-enums";
import { HttpError } from "../core/utils/error-handler";
import { UpdateProfileRequestBody } from "../Utils/types/auth-types";
import type { Express } from "express";

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

    // Get Admin profile details
    getAdminProfileDetails = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
      try {
        const userId = req.params.id;
        logger.debug(`Fetching profile details for userId: ${userId}`);
        if (!userId) {
          throw new HttpError(ERROR_MESSAGES.REQUIRED_USER_ID, StatusCodes.BAD_REQUEST);
        }
        const userDetails = await this._adminService.AdminprofileDetails(userId);
        if (!userDetails) {
          this.sendSuccess(res, { userDetails: null }, AUTH_MESSAGES.NO_USER_FOUND);
          logger.info(`No user found for ID: ${userId}`);
          return;
        }
        this.sendSuccess(res, { userDetails }, AUTH_MESSAGES.PROFILE_FETCHED);
        logger.info(`Profile details fetched for userId: ${userId}`);
      } catch (error) {
        logger.error(`Error fetching profile details for userId ${req.params.id || "unknown"}: ${error}`);
        next(error);
      }
    };
  
    // Update Admin profile
    updateAdminDetails = async (
      req: Request<{ id: string }, {}, UpdateProfileRequestBody>,
      res: Response,
      next: NextFunction
    ): Promise<void> => {
      try {
        const userId = req.params.id;
        logger.debug(`Updating profile for userId: ${userId}`);
        if (!userId) {
          throw new HttpError(ERROR_MESSAGES.REQUIRED_USER_ID, StatusCodes.BAD_REQUEST);
        }
        const data: UpdateProfileRequestBody = req.body;
        const profilePicFile = (req.files as { [fieldname: string]: Express.Multer.File[] })?.["profilePic"]?.[0];
        if (profilePicFile) data.profilePicFile = profilePicFile;
        const updatedUser = await this._adminService.updateAdminProfile(userId, data);
        this.sendSuccess(res, { user: updatedUser }, AUTH_MESSAGES.PROFILE_UPDATED);
        logger.info(`Profile updated for userId: ${userId}`);
      } catch (error) {
        logger.error(`Error updating profile for userId ${req.params.id || "unknown"}: ${error}`);
        next(error);
      }
    };
}
