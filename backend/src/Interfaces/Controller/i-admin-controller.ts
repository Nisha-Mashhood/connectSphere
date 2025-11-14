import { NextFunction, Request, Response } from "express";

export interface IAdminController {
  getTotalUsersCount(req: Request, res: Response, next: NextFunction): Promise<void>;
  getTotalMentorsCount(req: Request, res: Response, next: NextFunction): Promise<void>;
  getTotalRevenue(req: Request, res: Response, next: NextFunction): Promise<void>;
  getPendingMentorRequestsCount(req: Request, res: Response, next: NextFunction): Promise<void>;
  getActiveCollaborationsCount(req: Request, res: Response, next: NextFunction): Promise<void>;
  getRevenueTrends(req: Request, res: Response, next: NextFunction): Promise<void>;
  getUserGrowth(req: Request, res: Response, next: NextFunction): Promise<void>;
  getPendingMentorRequests(req: Request, res: Response, next: NextFunction): Promise<void>;
  getTopMentors(req: Request, res: Response, next: NextFunction): Promise<void>;
  getRecentCollaborations(req: Request, res: Response, next: NextFunction): Promise<void>;
  getAdminProfileDetails(req: Request, res: Response, next: NextFunction): Promise<void>;
  updateAdminDetails(req: Request, res: Response, next: NextFunction): Promise<void>;
}



