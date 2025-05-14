import express from 'express';
import * as ReviewController from '../controllers/review.controller.js';
import { apiLimiter } from '../middlewares/ratelimit.middleware.js';
import { authorize, checkBlockedStatus, verifyToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Submit a review
router.post('/submit',[apiLimiter, verifyToken,checkBlockedStatus],  ReviewController.submitReview);

// Skip a review
router.post('/skip',[apiLimiter, verifyToken,checkBlockedStatus],  ReviewController.skipReview);

// Get all reviews (admin)
router.get('/all', [apiLimiter, verifyToken, authorize('admin')],  ReviewController.getAllReviews);

// Approve a review (admin)
router.patch('/approve/:reviewId',[apiLimiter, verifyToken, authorize('admin')],  ReviewController.approveReview);

// Select a review (admin)
router.patch('/select/:reviewId',[apiLimiter, verifyToken, authorize('admin')],  ReviewController.selectReview);

// Get selected reviews (public)
router.get('/selected',[apiLimiter, verifyToken,checkBlockedStatus], ReviewController.getSelectedReviews);

export default router;