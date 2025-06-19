import express from 'express';
import { ReviewController } from '../Controllers/ReviewController.js';
import { apiLimiter } from '../../../middlewares/ratelimit.middleware.js';
import { AuthMiddleware } from '../../../middlewares/auth.middleware.js';

const router = express.Router();
const reviewController = new ReviewController();
const authMiddleware = new AuthMiddleware();

router.post(
  '/submit',
  [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus],
  reviewController.submitReview.bind(reviewController)
);

router.post(
  '/skip',
  [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus],
  reviewController.skipReview.bind(reviewController)
);

router.get(
  '/all',
  [apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin')],
  reviewController.getAllReviews.bind(reviewController)
);

router.patch(
  '/approve/:reviewId',
  [apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin')],
  reviewController.approveReview.bind(reviewController)
);

router.patch(
  '/select/:reviewId',
  [apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin')],
  reviewController.selectReview.bind(reviewController)
);

router.get(
  '/selected',
  [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus],
  reviewController.getSelectedReviews.bind(reviewController)
);

router.patch(
  '/cancel/:reviewId',
  [apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin')],
  reviewController.cancelApproval.bind(reviewController)
);

router.patch(
  '/deselect/:reviewId',
  [apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin')],
  reviewController.deselectReview.bind(reviewController)
);

export default router;