import { NextFunction, Request, Response } from 'express';

export interface IFeedbackController {
  createFeedback(req: Request, res: Response, next:NextFunction): Promise<void>;
  getMentorFeedbacks(req: Request, res: Response, next:NextFunction): Promise<void>;
  getUserFeedbacks(req: Request, res: Response, next:NextFunction): Promise<void>;
  getFeedbackForProfile(req: Request, res: Response, next:NextFunction): Promise<void>;
  getFeedbackByCollaborationId(req: Request, res: Response, next:NextFunction): Promise<void>;
  toggleFeedback(req: Request, res: Response, next:NextFunction): Promise<void>;
  getFeedbackByMentorId(req: Request, res: Response, next:NextFunction): Promise<void>;
}
