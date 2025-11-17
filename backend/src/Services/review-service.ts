import { inject, injectable } from "inversify";
import { ServiceError } from '../core/utils/error-handler';
import logger from '../core/utils/logger';
import { IReviewService } from '../Interfaces/Services/i-review-service';
import { StatusCodes } from '../enums/status-code-enums';
import { IReviewRepository } from "../Interfaces/Repository/i-review-repositry";
import { IUserRepository } from "../Interfaces/Repository/i-user-repositry";
import { toReviewDTO, toReviewDTOs } from "../Utils/mappers/review-mapper";
import { IReviewDTO } from "../Interfaces/DTOs/i-review-dto";

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

   public submitReview = async (userId: string, rating: number, comment: string): Promise<IReviewDTO> => {
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
      const reviewDTO = toReviewDTO(review);
      if (!reviewDTO) {
        logger.error(`Failed to map review ${review._id} to DTO`);
        throw new ServiceError("Failed to map review to DTO", StatusCodes.INTERNAL_SERVER_ERROR);
      }

      await this._userRepository.update(userId, { hasReviewed: true, loginCount: 0 });
      logger.info(`Review submitted for user: ${userId}, review ID: ${review._id}`);
      return reviewDTO;
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

  public getAllReviews = async ({
  page = 1,
  limit = 10,
  search = "",
}: {
  page?: number;
  limit?: number;
  search?: string;
}): Promise<{
  reviews: IReviewDTO[];
  total: number;
  page: number;
  pages: number;
}> => {
  try {
    logger.debug(
      `Fetching paginated reviews from service (page=${page}, limit=${limit}, search=${search})`
    );

    const result = await this._reviewRepository.getAllReviews({
      page,
      limit,
      search,
    });

    const reviewsDTO = toReviewDTOs(result.reviews);

    return {
      reviews: reviewsDTO,
      total: result.total,
      page: result.page,
      pages: result.pages,
    };
  } catch (error: any) {
    logger.error(`Error fetching paginated reviews: ${error.message}`);

    throw error instanceof ServiceError
      ? error
      : new ServiceError(
          "Failed to fetch paginated reviews",
          StatusCodes.INTERNAL_SERVER_ERROR,
          error
        );
  }
};

  public approveReview = async (reviewId: string): Promise<IReviewDTO | null> => {
    try {
      logger.debug(`Approving review: ${reviewId}`);
      const review = await this._reviewRepository.findReviewById(reviewId);
      if (!review) {
        logger.error(`Review not found: ${reviewId}`);
        throw new ServiceError("Review not found", StatusCodes.NOT_FOUND);
      }

      const updatedReview = await this._reviewRepository.updateReview(reviewId, { isApproved: true });
      if (!updatedReview) {
        logger.error(`Failed to update review: ${reviewId}`);
        throw new ServiceError("Failed to update review", StatusCodes.INTERNAL_SERVER_ERROR);
      }
      const reviewDTO = toReviewDTO(updatedReview);
      if (!reviewDTO) {
        logger.error(`Failed to map review ${updatedReview._id} to DTO`);
        throw new ServiceError("Failed to map review to DTO", StatusCodes.INTERNAL_SERVER_ERROR);
      }

      logger.info(`Review approved: ${reviewId}`);
      return reviewDTO;
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

  public selectReview = async (reviewId: string): Promise<IReviewDTO | null> => {
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
      if (!updatedReview) {
        logger.error(`Failed to update review: ${reviewId}`);
        throw new ServiceError("Failed to update review", StatusCodes.INTERNAL_SERVER_ERROR);
      }

      const reviewDTO = toReviewDTO(updatedReview);
      if (!reviewDTO) {
        logger.error(`Failed to map review ${updatedReview._id} to DTO`);
        throw new ServiceError("Failed to map review to DTO", StatusCodes.INTERNAL_SERVER_ERROR);
      }

      logger.info(`Review selected: ${reviewId}`);
      return reviewDTO;
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

  public cancelApproval = async (reviewId: string): Promise<IReviewDTO | null> => {
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
      if (!updatedReview) {
        logger.error(`Failed to update review: ${reviewId}`);
        throw new ServiceError("Failed to update review", StatusCodes.INTERNAL_SERVER_ERROR);
      }

      const reviewDTO = toReviewDTO(updatedReview);
      if (!reviewDTO) {
        logger.error(`Failed to map review ${updatedReview._id} to DTO`);
        throw new ServiceError("Failed to map review to DTO", StatusCodes.INTERNAL_SERVER_ERROR);
      }

      logger.info(`Approval canceled for review: ${reviewId}`);
      return reviewDTO;
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

  public deselectReview = async (reviewId: string): Promise<IReviewDTO | null> => {
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
      if (!updatedReview) {
        logger.error(`Failed to update review: ${reviewId}`);
        throw new ServiceError("Failed to update review", StatusCodes.INTERNAL_SERVER_ERROR);
      }

      const reviewDTO = toReviewDTO(updatedReview);
      if (!reviewDTO) {
        logger.error(`Failed to map review ${updatedReview._id} to DTO`);
        throw new ServiceError("Failed to map review to DTO", StatusCodes.INTERNAL_SERVER_ERROR);
      }

      logger.info(`Review deselected: ${reviewId}`);
      return reviewDTO;
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

  public getSelectedReviews = async (): Promise<IReviewDTO[]> => {
    try {
      logger.debug("Fetching selected reviews");
      const reviews = await this._reviewRepository.getSelectedReviews();
      const reviewDTOs = toReviewDTOs(reviews);
      logger.info(`Fetched ${reviewDTOs.length} selected reviews`);
      return reviewDTOs;
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