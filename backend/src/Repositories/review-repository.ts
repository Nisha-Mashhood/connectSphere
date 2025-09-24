import { injectable } from 'inversify';
import { Model, Types } from 'mongoose';
import { BaseRepository } from '../core/Repositries/base-repositry';
import { RepositoryError } from '../core/Utils/error-handler';
import logger from '../core/Utils/logger';
import Review from '../Models/review-model';
import { IReview } from '../Interfaces/Models/i-review';
import { StatusCodes } from '../enums/status-code-enums';
import { IReviewRepository } from '../Interfaces/Repository/i-review-repositry';

@injectable()
export class ReviewRepository extends BaseRepository<IReview> implements IReviewRepository {
  constructor() {
    super(Review as Model<IReview>);
  }

  private toObjectId = (id?: string | Types.ObjectId): Types.ObjectId => {
    if (!id) {
      logger.warn('Missing ID when converting to ObjectId');
      throw new RepositoryError('Invalid ID: ID is required', StatusCodes.BAD_REQUEST);
    }
    const idStr = typeof id === 'string' ? id : id.toString();
    if (!Types.ObjectId.isValid(idStr)) {
      logger.warn(`Invalid ObjectId format: ${idStr}`);
      throw new RepositoryError('Invalid ID: must be a 24 character hex string', StatusCodes.BAD_REQUEST);
    }
    return new Types.ObjectId(idStr);
  }

  public createReview = async (data: { userId: string; rating: number; comment: string }): Promise<IReview> => {
    try {
      logger.debug(`Creating review for user: ${data.userId}`);
      const review = await this.create({
        userId: this.toObjectId(data.userId),
        rating: data.rating,
        comment: data.comment,
        isApproved: false,
        isSelect: false,
        createdAt: new Date(),
      });
      logger.info(`Review created: ${review._id}`);
      return review;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error creating review for user ${data.userId}`, err);
      throw new RepositoryError('Error creating review', StatusCodes.INTERNAL_SERVER_ERROR, err);
    }
  }

  public findReviewById = async (reviewId: string): Promise<IReview | null> => {
    try {
      logger.debug(`Fetching review by ID: ${reviewId}`);
      const review = await this.model
        .findById(this.toObjectId(reviewId))
        .populate('userId', 'email username')
        .exec();
      if (!review) {
        logger.warn(`Review not found: ${reviewId}`);
        throw new RepositoryError(`Review not found with ID: ${reviewId}`, StatusCodes.NOT_FOUND);
      }
      logger.info(`Review found: ${reviewId}`);
      return review;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error fetching review by ID ${reviewId}`, err);
      throw new RepositoryError('Error fetching review by ID', StatusCodes.INTERNAL_SERVER_ERROR, err);
    }
  }

  public getAllReviews = async (): Promise<IReview[]> => {
    try {
      logger.debug('Fetching all reviews');
      const reviews = await this.model
        .find()
        .populate('userId', 'email username')
        .sort({ createdAt: -1 })
        .exec();
      logger.info(`Fetched ${reviews.length} reviews`);
      return reviews;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error fetching all reviews`, err);
      throw new RepositoryError('Error fetching all reviews', StatusCodes.INTERNAL_SERVER_ERROR, err);
    }
  }

  public updateReview = async (
    reviewId: string,
    updates: { isApproved?: boolean; isSelect?: boolean }
  ): Promise<IReview | null> => {
    try {
      logger.debug(`Updating review: ${reviewId}`);
      const review = await this.model
        .findByIdAndUpdate(this.toObjectId(reviewId), updates, { new: true })
        .populate('userId', 'email username')
        .exec();
      if (!review) {
        logger.warn(`Review not found: ${reviewId}`);
        throw new RepositoryError(`Review not found with ID: ${reviewId}`, StatusCodes.NOT_FOUND);
      }
      logger.info(`Review updated: ${reviewId}`);
      return review;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error updating review ${reviewId}`, err);
      throw new RepositoryError('Error updating review', StatusCodes.INTERNAL_SERVER_ERROR, err);
    }
  }

  public getSelectedReviews = async (): Promise<IReview[]> => {
    try {
      logger.debug('Fetching selected and approved reviews');
      const reviews = await this.model
        .find({ isSelect: true, isApproved: true })
        .populate('userId', 'email username')
        .exec();
      logger.info(`Fetched ${reviews.length} selected and approved reviews`);
      return reviews;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error fetching selected reviews`, err);
      throw new RepositoryError('Error fetching selected reviews', StatusCodes.INTERNAL_SERVER_ERROR, err);
    }
  }
}