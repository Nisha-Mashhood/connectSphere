import { NextFunction, Request, Response } from 'express';

export interface IReviewController {
  submitReview(req: Request, res: Response, next:NextFunction): Promise<void>;
  skipReview(req: Request, res: Response, next:NextFunction): Promise<void>;
  getAllReviews(req: Request, res: Response, next:NextFunction): Promise<void>;
  approveReview(req: Request, res: Response, next:NextFunction): Promise<void>;
  selectReview(req: Request, res: Response, next:NextFunction): Promise<void>;
  cancelApproval(req: Request, res: Response, next:NextFunction): Promise<void>;
  deselectReview(req: Request, res: Response, next:NextFunction): Promise<void>;
  getSelectedReviews(req: Request, res: Response, next:NextFunction): Promise<void>;
}