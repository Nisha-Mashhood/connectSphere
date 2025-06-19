import { BaseService } from '../../../core/Services/BaseService.js';
import { ServiceError } from '../../../core/Utils/ErrorHandler.js';
import logger from '../../../core/Utils/Logger.js';
import { ReviewRepository } from '../Repositry/ReviewRepositry.js';
import { UserRepository } from '../../Auth/Repositry/UserRepositry.js';
export class ReviewService extends BaseService {
    reviewRepo;
    userRepo;
    constructor() {
        super();
        this.reviewRepo = new ReviewRepository();
        this.userRepo = new UserRepository();
    }
    async submitReview(userId, rating, comment) {
        try {
            logger.debug(`Submitting review for user: ${userId}`);
            this.checkData({ userId, rating, comment });
            const user = await this.userRepo.findById(userId);
            if (!user) {
                logger.error(`User not found: ${userId}`);
                throw new ServiceError('User not found');
            }
            if (user.hasReviewed) {
                logger.error(`User has already submitted a review: ${userId}`);
                throw new ServiceError('User has already submitted a review');
            }
            if (rating < 1 || rating > 5) {
                logger.error(`Invalid rating: ${rating}`);
                throw new ServiceError('Rating must be between 1 and 5');
            }
            const review = await this.reviewRepo.createReview({ userId, rating, comment });
            await this.userRepo.update(userId, { hasReviewed: true, loginCount: 0 });
            return review;
        }
        catch (error) {
            logger.error(`Error submitting review: ${error.message}`);
            throw new ServiceError(`Error submitting review: ${error.message}`);
        }
    }
    async skipReview(userId) {
        try {
            logger.debug(`Skipping review for user: ${userId}`);
            this.checkData(userId);
            const user = await this.userRepo.findById(userId);
            if (!user) {
                logger.error(`User not found: ${userId}`);
                throw new ServiceError('User not found');
            }
            await this.userRepo.update(userId, { loginCount: 0 });
        }
        catch (error) {
            logger.error(`Error skipping review: ${error.message}`);
            throw new ServiceError(`Error skipping review: ${error.message}`);
        }
    }
    async getAllReviews() {
        try {
            logger.debug('Fetching all reviews');
            const reviews = await this.reviewRepo.getAllReviews();
            return reviews || [];
        }
        catch (error) {
            logger.error(`Error fetching all reviews: ${error.message}`);
            throw new ServiceError(`Error fetching all reviews: ${error.message}`);
        }
    }
    async approveReview(reviewId) {
        try {
            logger.debug(`Approving review: ${reviewId}`);
            this.checkData(reviewId);
            const review = await this.reviewRepo.findById(reviewId);
            if (!review) {
                logger.error(`Review not found: ${reviewId}`);
                throw new ServiceError('Review not found');
            }
            return await this.reviewRepo.updateReview(reviewId, { isApproved: true });
        }
        catch (error) {
            logger.error(`Error approving review: ${error.message}`);
            throw new ServiceError(`Error approving review: ${error.message}`);
        }
    }
    async selectReview(reviewId) {
        try {
            logger.debug(`Selecting review: ${reviewId}`);
            this.checkData(reviewId);
            const review = await this.reviewRepo.findById(reviewId);
            if (!review) {
                logger.error(`Review not found: ${reviewId}`);
                throw new ServiceError('Review not found');
            }
            if (!review.isApproved) {
                logger.error(`Review not approved: ${reviewId}`);
                throw new ServiceError('Review must be approved before selecting');
            }
            return await this.reviewRepo.updateReview(reviewId, { isSelect: true });
        }
        catch (error) {
            logger.error(`Error selecting review: ${error.message}`);
            throw new ServiceError(`Error selecting review: ${error.message}`);
        }
    }
    async cancelApproval(reviewId) {
        try {
            logger.debug(`Canceling approval for review: ${reviewId}`);
            this.checkData(reviewId);
            const review = await this.reviewRepo.findById(reviewId);
            if (!review) {
                logger.error(`Review not found: ${reviewId}`);
                throw new ServiceError('Review not found');
            }
            return await this.reviewRepo.updateReview(reviewId, { isApproved: false, isSelect: false });
        }
        catch (error) {
            logger.error(`Error canceling approval: ${error.message}`);
            throw new ServiceError(`Error canceling approval: ${error.message}`);
        }
    }
    async deselectReview(reviewId) {
        try {
            logger.debug(`Deselecting review: ${reviewId}`);
            this.checkData(reviewId);
            const review = await this.reviewRepo.findById(reviewId);
            if (!review) {
                logger.error(`Review not found: ${reviewId}`);
                throw new ServiceError('Review not found');
            }
            if (!review.isSelect) {
                logger.error(`Review not selected: ${reviewId}`);
                throw new ServiceError('Review not selected');
            }
            return await this.reviewRepo.updateReview(reviewId, { isSelect: false });
        }
        catch (error) {
            logger.error(`Error deselecting review: ${error.message}`);
            throw new ServiceError(`Error deselecting review: ${error.message}`);
        }
    }
    async getSelectedReviews() {
        try {
            logger.debug('Fetching selected reviews');
            const reviews = await this.reviewRepo.getSelectedReviews();
            return reviews || [];
        }
        catch (error) {
            logger.error(`Error fetching selected reviews: ${error.message}`);
            throw new ServiceError(`Error fetching selected reviews: ${error.message}`);
        }
    }
}
//# sourceMappingURL=ReviewService.js.map