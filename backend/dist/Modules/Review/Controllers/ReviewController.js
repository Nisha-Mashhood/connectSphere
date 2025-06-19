import { ReviewService } from '../Service/ReviewService.js';
import logger from '../../../core/Utils/Logger.js';
export class ReviewController {
    reviewService;
    constructor() {
        this.reviewService = new ReviewService();
    }
    async submitReview(req, res) {
        try {
            const { userId, rating, comment } = req.body;
            logger.debug(`Submitting review for user: ${userId}`);
            if (!userId || !rating || !comment) {
                logger.error('Missing required fields: userId, rating, or comment');
                throw new Error('Missing required fields');
            }
            const review = await this.reviewService.submitReview(userId, rating, comment);
            res.status(201).json({
                success: true,
                message: 'Review submitted successfully',
                data: review,
            });
        }
        catch (error) {
            logger.error(`Error submitting review: ${error.message}`);
            res.status(400).json({
                success: false,
                message: error.message || 'Error submitting review',
            });
        }
    }
    async skipReview(req, res) {
        try {
            const { userId } = req.body;
            logger.debug(`Skipping review for user: ${userId}`);
            if (!userId) {
                logger.error('Missing userId');
                throw new Error('Missing userId');
            }
            await this.reviewService.skipReview(userId);
            res.status(200).json({
                success: true,
                message: 'Review skipped successfully',
                data: null,
            });
        }
        catch (error) {
            logger.error(`Error skipping review: ${error.message}`);
            res.status(400).json({
                success: false,
                message: error.message || 'Error skipping review',
            });
        }
    }
    async getAllReviews(_req, res) {
        try {
            logger.debug('Fetching all reviews');
            const reviews = await this.reviewService.getAllReviews();
            res.status(200).json({
                success: true,
                message: 'Reviews fetched successfully',
                data: reviews,
            });
        }
        catch (error) {
            logger.error(`Error fetching all reviews: ${error.message}`);
            res.status(400).json({
                success: false,
                message: error.message || 'Error fetching reviews',
            });
        }
    }
    async approveReview(req, res) {
        try {
            const { reviewId } = req.params;
            logger.debug(`Approving review: ${reviewId}`);
            const review = await this.reviewService.approveReview(reviewId);
            res.status(200).json({
                success: true,
                message: 'Review approved successfully',
                data: review,
            });
        }
        catch (error) {
            logger.error(`Error approving review: ${error.message}`);
            res.status(400).json({
                success: false,
                message: error.message || 'Error approving review',
            });
        }
    }
    async selectReview(req, res) {
        try {
            const { reviewId } = req.params;
            logger.debug(`Selecting review: ${reviewId}`);
            const review = await this.reviewService.selectReview(reviewId);
            res.status(200).json({
                success: true,
                message: 'Review selected successfully',
                data: review,
            });
        }
        catch (error) {
            logger.error(`Error selecting review: ${error.message}`);
            res.status(400).json({
                success: false,
                message: error.message || 'Error selecting review',
            });
        }
    }
    async cancelApproval(req, res) {
        try {
            const { reviewId } = req.params;
            logger.debug(`Canceling approval for review: ${reviewId}`);
            const review = await this.reviewService.cancelApproval(reviewId);
            res.status(200).json({
                success: true,
                message: 'Review approval canceled successfully',
                data: review,
            });
        }
        catch (error) {
            logger.error(`Error canceling approval: ${error.message}`);
            res.status(400).json({
                success: false,
                message: error.message || 'Error canceling approval',
            });
        }
    }
    async deselectReview(req, res) {
        try {
            const { reviewId } = req.params;
            logger.debug(`Deselecting review: ${reviewId}`);
            const review = await this.reviewService.deselectReview(reviewId);
            res.status(200).json({
                success: true,
                message: 'Review deselected successfully',
                data: review,
            });
        }
        catch (error) {
            logger.error(`Error deselecting review: ${error.message}`);
            res.status(400).json({
                success: false,
                message: error.message || 'Error deselecting review',
            });
        }
    }
    async getSelectedReviews(_req, res) {
        try {
            logger.debug('Fetching selected reviews');
            const reviews = await this.reviewService.getSelectedReviews();
            res.status(200).json({
                success: true,
                message: 'Selected reviews fetched successfully',
                data: reviews,
            });
        }
        catch (error) {
            logger.error(`Error fetching selected reviews: ${error.message}`);
            res.status(400).json({
                success: false,
                message: error.message || 'Error fetching selected reviews',
            });
        }
    }
}
//# sourceMappingURL=ReviewController.js.map