import { NextFunction, Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import logger from '../core/utils/logger';
import { IReviewController } from '../Interfaces/Controller/i-review-controller';
import { HttpError } from '../core/utils/error-handler';
import { StatusCodes } from "../enums/status-code-enums";
import { BaseController } from '../core/controller/base-controller';
import { IReviewService } from '../Interfaces/Services/i-review-service';
import { REVIEW_MESSAGES } from '../constants/messages';
import { ERROR_MESSAGES } from '../constants/error-messages';

@injectable()
export class ReviewController extends BaseController implements IReviewController{
  private _reviewService: IReviewService;

  constructor(@inject('IReviewService') reviewService : IReviewService) {
    super();
    this._reviewService = reviewService;
  }

   submitReview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId, rating, comment } = req.body;
      logger.debug(`Submitting review for user: ${userId}`);
      if (!userId || !rating || !comment) {
        logger.error("Missing required fields: userId, rating, or comment");
        throw new HttpError(ERROR_MESSAGES.REQUIRED_REVIEW_FIELDS, StatusCodes.BAD_REQUEST);
      }
      const review = await this._reviewService.submitReview(userId, rating, comment);
      this.sendCreated(res, review, REVIEW_MESSAGES.REVIEW_SUBMITTED);
    } catch (error: any) {
      logger.error(`Error submitting review: ${error.message}`);
      next(error);
    }
  };

  skipReview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId } = req.body;
      logger.debug(`Skipping review for user: ${userId}`);
      if (!userId) {
        logger.error("Missing userId");
        throw new HttpError(ERROR_MESSAGES.REQUIRED_USER_ID, StatusCodes.BAD_REQUEST);
      }
      await this._reviewService.skipReview(userId);
      this.sendSuccess(res, null, REVIEW_MESSAGES.REVIEW_SKIPPED);
    } catch (error: any) {
      logger.error(`Error skipping review: ${error.message}`);
      next(error);
    }
  };

  getAllReviews = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = (req.query.search as string) || "";

    logger.debug(
      `Controller: fetching reviews (page=${page}, limit=${limit}, search=${search})`
    );

    const result = await this._reviewService.getAllReviews({
      page,
      limit,
      search,
    });

    this.sendSuccess(res, result, REVIEW_MESSAGES.REVIEWS_FETCHED);
  } catch (error: any) {
    logger.error(`Error fetching paginated reviews: ${error.message}`);
    next(error);
  }
};

  approveReview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { reviewId } = req.params;
      logger.debug(`Approving review: ${reviewId}`);
      const review = await this._reviewService.approveReview(reviewId);
      this.sendSuccess(res, review, REVIEW_MESSAGES.REVIEW_APPROVED);
    } catch (error: any) {
      logger.error(`Error approving review: ${error.message}`);
      next(error);
    }
  };

  selectReview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { reviewId } = req.params;
      logger.debug(`Selecting review: ${reviewId}`);
      const review = await this._reviewService.selectReview(reviewId);
      this.sendSuccess(res, review, REVIEW_MESSAGES.REVIEW_SELECTED);
    } catch (error: any) {
      logger.error(`Error selecting review: ${error.message}`);
      next(error);
    }
  };

  cancelApproval = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { reviewId } = req.params;
      logger.debug(`Canceling approval for review: ${reviewId}`);
      const review = await this._reviewService.cancelApproval(reviewId);
      this.sendSuccess(res, review, REVIEW_MESSAGES.REVIEW_APPROVAL_CANCELED);
    } catch (error: any) {
      logger.error(`Error canceling approval: ${error.message}`);
      next(error);
    }
  };

  deselectReview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { reviewId } = req.params;
      logger.debug(`Deselecting review: ${reviewId}`);
      const review = await this._reviewService.deselectReview(reviewId);
      this.sendSuccess(res, review, REVIEW_MESSAGES.REVIEW_DESELECTED);
    } catch (error: any) {
      logger.error(`Error deselecting review: ${error.message}`);
      next(error);
    }
  };

  getSelectedReviews = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      logger.debug("Fetching selected reviews");
      const reviews = await this._reviewService.getSelectedReviews();
      const data = reviews.length === 0 ? [] : reviews;
      const message = reviews.length === 0 ? REVIEW_MESSAGES.NO_REVIEWS_FOUND : REVIEW_MESSAGES.SELECTED_REVIEWS_FETCHED;

      this.sendSuccess(res, data, message);
    } catch (error: any) {
      logger.error(`Error fetching selected reviews: ${error.message}`);
      next(error);
    }
  };
}