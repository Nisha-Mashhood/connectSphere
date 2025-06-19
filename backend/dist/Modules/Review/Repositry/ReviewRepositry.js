import { Types } from 'mongoose';
import { BaseRepository } from '../../../core/Repositries/BaseRepositry.js';
import { RepositoryError } from '../../../core/Utils/ErrorHandler.js';
import logger from '../../../core/Utils/Logger.js';
import Review from '../../../models/Review.modal.js';
export class ReviewRepository extends BaseRepository {
    constructor() {
        super(Review);
    }
    toObjectId(id) {
        if (!id) {
            logger.error('Missing ID');
            throw new RepositoryError('Invalid ID: ID is required');
        }
        const idStr = typeof id === 'string' ? id : id.toString();
        if (!Types.ObjectId.isValid(idStr)) {
            logger.error(`Invalid ID: ${idStr}`);
            throw new RepositoryError('Invalid ID: must be a 24 character hex string');
        }
        return new Types.ObjectId(idStr);
    }
    async createReview(data) {
        try {
            logger.debug(`Creating review for user: ${data.userId}`);
            return await this.create({
                userId: this.toObjectId(data.userId),
                rating: data.rating,
                comment: data.comment,
                isApproved: false,
                isSelect: false,
                createdAt: new Date(),
            });
        }
        catch (error) {
            logger.error(`Error creating review: ${error.message}`);
            throw new RepositoryError(`Error creating review: ${error.message}`);
        }
    }
    async findById(reviewId) {
        try {
            logger.debug(`Fetching review by ID: ${reviewId}`);
            return await this.model
                .findOne({ reviewId })
                .populate('userId', 'email username')
                .exec();
        }
        catch (error) {
            logger.error(`Error fetching review by ID: ${error.message}`);
            throw new RepositoryError(`Error fetching review by ID: ${error.message}`);
        }
    }
    async getAllReviews() {
        try {
            logger.debug('Fetching all reviews');
            return await this.model
                .find()
                .populate('userId', 'email username')
                .sort({ createdAt: -1 })
                .exec();
        }
        catch (error) {
            logger.error(`Error fetching all reviews: ${error.message}`);
            throw new RepositoryError(`Error fetching all reviews: ${error.message}`);
        }
    }
    async updateReview(reviewId, updates) {
        try {
            logger.debug(`Updating review: ${reviewId}`);
            const review = await this.model
                .findOneAndUpdate({ reviewId }, updates, { new: true })
                .populate('userId', 'email username')
                .exec();
            if (!review) {
                logger.error(`Review not found: ${reviewId}`);
                throw new RepositoryError('Review not found');
            }
            return review;
        }
        catch (error) {
            logger.error(`Error updating review: ${error.message}`);
            throw new RepositoryError(`Error updating review: ${error.message}`);
        }
    }
    async getSelectedReviews() {
        try {
            logger.debug('Fetching selected and approved reviews');
            return await this.model
                .find({ isSelect: true, isApproved: true })
                .populate('userId', 'email username')
                .exec();
        }
        catch (error) {
            logger.error(`Error fetching selected reviews: ${error.message}`);
            throw new RepositoryError(`Error fetching selected reviews: ${error.message}`);
        }
    }
}
//# sourceMappingURL=ReviewRepositry.js.map