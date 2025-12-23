import { NextFunction, Request, Response } from "express";

export interface IMentorController {
  checkMentorStatus(req: Request, res: Response, next:NextFunction): Promise<void>;
  getMentorDetails(req: Request, res: Response, next:NextFunction): Promise<void>;
  createMentor(req: Request, res: Response, next:NextFunction): Promise<void>;
  getAllMentorRequests(req: Request, res: Response, next:NextFunction): Promise<void>;
  getMentorExperiences(req: Request, res: Response, next: NextFunction): Promise<void>
  getAllMentors(req: Request, res: Response, next:NextFunction): Promise<void>;
  getMentorByUserId(req: Request, res: Response, next:NextFunction): Promise<void>;
  approveMentorRequest(req: Request, res: Response, next:NextFunction): Promise<void>;
  rejectMentorRequest(req: Request, res: Response, next:NextFunction): Promise<void>;
  cancelMentorship(req: Request, res: Response, next:NextFunction): Promise<void>;
  updateMentorProfile(req: Request, res: Response, next:NextFunction): Promise<void>;
  getMentorAnalytics(req: Request, res: Response, next:NextFunction): Promise<void>;
  getSalesReport(req: Request, res: Response, next:NextFunction): Promise<void>;
  addExperience(req: Request, res: Response, next: NextFunction): Promise<void>;
  updateExperience(req: Request, res: Response, next: NextFunction): Promise<void>;
  deleteExperience(req: Request, res: Response, next: NextFunction): Promise<void>;
  downloadSalesReportPDF(req: Request, res: Response, next: NextFunction): Promise<void>;
}