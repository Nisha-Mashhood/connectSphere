import { NextFunction, Request, Response } from 'express';
import { inject } from 'inversify';
import logger from '../Core/Utils/Logger';
import { IReviewController } from '../Interfaces/Controller/IReviewController';
import { HttpError } from '../Core/Utils/ErrorHandler';
import { StatusCodes } from "../Enums/StatusCode.constants";
import { BaseController } from '../Core/Controller/BaseController';
import { IReviewService } from '../Interfaces/Services/IReviewService';

export class ReviewController extends BaseController implements IReviewController{
  private _reviewService: IReviewService;

  constructor(@inject('IReviewService') reviewService : IReviewService) {
    super();
    this._reviewService = reviewService;
  }

   submitReview  = async(req: Request, res: Response, next:NextFunction): Promise<void> => {
    try {
      const { userId, rating, comment } = req.body;
      logger.debug(`Submitting review for user: ${userId}`);
      if (!userId || !rating || !comment) {
        logger.error('Missing required fields: userId, rating, or comment');
        throw new HttpError('Missing required fields', StatusCodes.BAD_REQUEST);
      }
      const review = await this._reviewService.submitReview(userId, rating, comment);
      this.sendCreated(res, review, 'Review submitted successfully');
    } catch (error: any) {
      logger.error(`Error submitting review: ${error.message}`);
      next(error)
    }
  }

   skipReview  = async(req: Request, res: Response, next:NextFunction): Promise<void> => {
    try {
      const { userId } = req.body;
      logger.debug(`Skipping review for user: ${userId}`);
      if (!userId) {
        logger.error('Missing userId');
        throw new HttpError('Missing userId', StatusCodes.BAD_REQUEST);
      }
      await this._reviewService.skipReview(userId);
      this.sendSuccess(res, null, 'Review skipped successfully');
    } catch (error: any) {
      logger.error(`Error skipping review: ${error.message}`);
      next(error)
    }
  }

   getAllReviews = async(_req: Request, res: Response, next:NextFunction): Promise<void> =>{
    try {
      logger.debug('Fetching all reviews');
      const reviews = await this._reviewService.getAllReviews();
      const data = reviews.length === 0 ? [] : reviews;
      const message = reviews.length === 0 ? 'No reviews found' : 'Reviews fetched successfully';

      this.sendSuccess(res, data, message);
    } catch (error: any) {
      logger.error(`Error fetching all reviews: ${error.message}`);
      next(error)
    }
  }

   approveReview  = async(req: Request, res: Response, next:NextFunction): Promise<void> => {
    try {
      const { reviewId } = req.params;
      logger.debug(`Approving review: ${reviewId}`);
      const review = await this._reviewService.approveReview(reviewId);
      this.sendSuccess(res, review, 'Review approved successfully');
    } catch (error: any) {
      logger.error(`Error approving review: ${error.message}`);
      next(error)
    }
  }

   selectReview  = async(req: Request, res: Response, next:NextFunction): Promise<void> => {
    try {
      const { reviewId } = req.params;
      logger.debug(`Selecting review: ${reviewId}`);
      const review = await this._reviewService.selectReview(reviewId);
      this.sendSuccess(res, review, 'Review selected successfully');
    } catch (error: any) {
      logger.error(`Error selecting review: ${error.message}`);
      next(error)
    }
  }

   cancelApproval  = async(req: Request, res: Response, next:NextFunction): Promise<void> => {
    try {
      const { reviewId } = req.params;
      logger.debug(`Canceling approval for review: ${reviewId}`);
      const review = await this._reviewService.cancelApproval(reviewId);
      this.sendSuccess(res, review, 'Review approval canceled successfully');
    } catch (error: any) {
      logger.error(`Error canceling approval: ${error.message}`);
      next(error)
    }
  }

   deselectReview  = async(req: Request, res: Response, next:NextFunction): Promise<void> => {
    try {
      const { reviewId } = req.params;
      logger.debug(`Deselecting review: ${reviewId}`);
      const review = await this._reviewService.deselectReview(reviewId);
      this.sendSuccess(res, review, 'Review deselected successfully');
    } catch (error: any) {
      logger.error(`Error deselecting review: ${error.message}`);
      next(error)
    }
  }

   getSelectedReviews = async(_req: Request, res: Response, next:NextFunction): Promise<void> => {
    try {
      logger.debug('Fetching selected reviews');
      const reviews = await this._reviewService.getSelectedReviews();
      const data = reviews.length === 0 ? [] : reviews;
    const message = reviews.length === 0 ? 'No selected reviews found' : 'Selected reviews fetched successfully';

    this.sendSuccess(res, data, message);
    } catch (error: any) {
      logger.error(`Error fetching selected reviews: ${error.message}`);
      next(error)
    }
  }
}