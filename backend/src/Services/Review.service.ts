import { inject, injectable } from "inversify";
import { ServiceError } from '../Core/Utils/ErrorHandler';
import logger from '../Core/Utils/Logger';
import { IReview } from '../Interfaces/Models/IReview';
import { IReviewService } from '../Interfaces/Services/IReviewService';
import { StatusCodes } from '../Enums/StatusCode.constants';
import { IReviewRepository } from "../Interfaces/Repository/IReviewRepository";
import { IUserRepository } from "../Interfaces/Repository/IUserRepository";

@injectable()
export class ReviewService implements IReviewService{
  private _reviewRepository: IReviewRepository;
  private _userRepository: IUserRepository;

  constructor(
    @inject('IReviewRepository') reviewRepository : IReviewRepository,
    @inject('IUserRepository') userRepository : IUserRepository,
  ) {
    this._reviewRepository = reviewRepository;
    this._userRepository = userRepository;
  }

   public submitReview = async (userId: string, rating: number, comment: string): Promise<IReview> => {
    try {
      logger.debug(`Submitting review for user: ${userId}`);
      if (rating < 1 || rating > 5) {
        logger.error(`Invalid rating: ${rating}`);
        throw new ServiceError("Rating must be between 1 and 5", StatusCodes.BAD_REQUEST);
      }

      if (!comment || comment.trim() === "") {
        logger.error("Comment is required");
        throw new ServiceError("Comment is required", StatusCodes.BAD_REQUEST);
      }

      const user = await this._userRepository.findById(userId);
      if (!user) {
        logger.error(`User not found: ${userId}`);
        throw new ServiceError("User not found", StatusCodes.NOT_FOUND);
      }

      if (user.hasReviewed) {
        logger.error(`User has already submitted a review: ${userId}`);
        throw new ServiceError("User has already submitted a review", StatusCodes.BAD_REQUEST);
      }

      const review = await this._reviewRepository.createReview({ userId, rating, comment });
      await this._userRepository.update(userId, { hasReviewed: true, loginCount: 0 });
      logger.info(`Review submitted for user: ${userId}, review ID: ${review._id}`);
      return review;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error submitting review for user ${userId}: ${err.message}`);
      throw error instanceof ServiceError
        ? error
        : new ServiceError(
            "Failed to submit review",
            StatusCodes.INTERNAL_SERVER_ERROR,
            err
          );
    }
  };

  public skipReview = async (userId: string): Promise<void> => {
    try {
      logger.debug(`Skipping review for user: ${userId}`);
      const user = await this._userRepository.findById(userId);
      if (!user) {
        logger.error(`User not found: ${userId}`);
        throw new ServiceError("User not found", StatusCodes.NOT_FOUND);
      }

      await this._userRepository.update(userId, { loginCount: 0 });
      logger.info(`Review skipped for user: ${userId}`);
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error skipping review for user ${userId}: ${err.message}`);
      throw error instanceof ServiceError
        ? error
        : new ServiceError(
            "Failed to skip review",
            StatusCodes.INTERNAL_SERVER_ERROR,
            err
          );
    }
  };

  public getAllReviews = async (): Promise<IReview[]> => {
    try {
      logger.debug("Fetching all reviews");
      const reviews = await this._reviewRepository.getAllReviews();
      logger.info(`Fetched ${reviews.length} reviews`);
      return reviews || [];
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error fetching all reviews: ${err.message}`);
      throw error instanceof ServiceError
        ? error
        : new ServiceError(
            "Failed to fetch all reviews",
            StatusCodes.INTERNAL_SERVER_ERROR,
            err
          );
    }
  };

  public approveReview = async (reviewId: string): Promise<IReview | null> => {
    try {
      logger.debug(`Approving review: ${reviewId}`);
      const review = await this._reviewRepository.findReviewById(reviewId);
      if (!review) {
        logger.error(`Review not found: ${reviewId}`);
        throw new ServiceError("Review not found", StatusCodes.NOT_FOUND);
      }

      const updatedReview = await this._reviewRepository.updateReview(reviewId, { isApproved: true });
      logger.info(`Review approved: ${reviewId}`);
      return updatedReview;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error approving review ${reviewId}: ${err.message}`);
      throw error instanceof ServiceError
        ? error
        : new ServiceError(
            "Failed to approve review",
            StatusCodes.INTERNAL_SERVER_ERROR,
            err
          );
    }
  };

  public selectReview = async (reviewId: string): Promise<IReview | null> => {
    try {
      logger.debug(`Selecting review: ${reviewId}`);
      const review = await this._reviewRepository.findReviewById(reviewId);
      if (!review) {
        logger.error(`Review not found: ${reviewId}`);
        throw new ServiceError("Review not found", StatusCodes.NOT_FOUND);
      }

      if (!review.isApproved) {
        logger.error(`Review not approved: ${reviewId}`);
        throw new ServiceError(
          "Review must be approved before selecting",
          StatusCodes.BAD_REQUEST
        );
      }

      const updatedReview = await this._reviewRepository.updateReview(reviewId, { isSelect: true });
      logger.info(`Review selected: ${reviewId}`);
      return updatedReview;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error selecting review ${reviewId}: ${err.message}`);
      throw error instanceof ServiceError
        ? error
        : new ServiceError(
            "Failed to select review",
            StatusCodes.INTERNAL_SERVER_ERROR,
            err
          );
    }
  };

  public cancelApproval = async (reviewId: string): Promise<IReview | null> => {
    try {
      logger.debug(`Canceling approval for review: ${reviewId}`);
      const review = await this._reviewRepository.findReviewById(reviewId);
      if (!review) {
        logger.error(`Review not found: ${reviewId}`);
        throw new ServiceError("Review not found", StatusCodes.NOT_FOUND);
      }

      const updatedReview = await this._reviewRepository.updateReview(reviewId, {
        isApproved: false,
        isSelect: false,
      });
      logger.info(`Approval canceled for review: ${reviewId}`);
      return updatedReview;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error canceling approval for review ${reviewId}: ${err.message}`);
      throw error instanceof ServiceError
        ? error
        : new ServiceError(
            "Failed to cancel approval",
            StatusCodes.INTERNAL_SERVER_ERROR,
            err
          );
    }
  };

  public deselectReview = async (reviewId: string): Promise<IReview | null> => {
    try {
      logger.debug(`Deselecting review: ${reviewId}`);

      const review = await this._reviewRepository.findReviewById(reviewId);
      if (!review) {
        logger.error(`Review not found: ${reviewId}`);
        throw new ServiceError("Review not found", StatusCodes.NOT_FOUND);
      }

      if (!review.isSelect) {
        logger.error(`Review not selected: ${reviewId}`);
        throw new ServiceError("Review not selected", StatusCodes.BAD_REQUEST);
      }

      const updatedReview = await this._reviewRepository.updateReview(reviewId, { isSelect: false });
      logger.info(`Review deselected: ${reviewId}`);
      return updatedReview;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error deselecting review ${reviewId}: ${err.message}`);
      throw error instanceof ServiceError
        ? error
        : new ServiceError(
            "Failed to deselect review",
            StatusCodes.INTERNAL_SERVER_ERROR,
            err
          );
    }
  };

  public getSelectedReviews = async (): Promise<IReview[]> => {
    try {
      logger.debug("Fetching selected reviews");
      const reviews = await this._reviewRepository.getSelectedReviews();
      logger.info(`Fetched ${reviews.length} selected reviews`);
      return reviews || [];
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error fetching selected reviews: ${err.message}`);
      throw error instanceof ServiceError
        ? error
        : new ServiceError(
            "Failed to fetch selected reviews",
            StatusCodes.INTERNAL_SERVER_ERROR,
            err
          );
    }
  }
}