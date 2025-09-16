import express from 'express';
import { ReviewController } from '../../Controllers/Review.controller';
import { apiLimiter } from '../../middlewares/ratelimit.middleware';
import { AuthMiddleware } from '../../middlewares/auth.middleware';
import { REVIEW_ROUTES } from '../Constants/Review.routes';

const router = express.Router();
const reviewController = new ReviewController();
const authMiddleware = new AuthMiddleware();


router.post(
  REVIEW_ROUTES.SubmitReview,
  [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus],
  reviewController.submitReview.bind(reviewController)
);

router.post(
  REVIEW_ROUTES.SkipReview,
  [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus],
  reviewController.skipReview.bind(reviewController)
);

router.get(
  REVIEW_ROUTES.GetAllReviews,
  [apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin')],
  reviewController.getAllReviews.bind(reviewController)
);

router.patch(
  REVIEW_ROUTES.ApproveReview,
  [apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin')],
  reviewController.approveReview.bind(reviewController)
);

router.patch(
  REVIEW_ROUTES.SelectReview,
  [apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin')],
  reviewController.selectReview.bind(reviewController)
);

router.get(
  REVIEW_ROUTES.GetSelectedReviews,
  [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus],
  reviewController.getSelectedReviews.bind(reviewController)
);

router.patch(
  REVIEW_ROUTES.CancelApproval,
  [apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin')],
  reviewController.cancelApproval.bind(reviewController)
);

router.patch(
  REVIEW_ROUTES.DeselectReview,
  [apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin')],
  reviewController.deselectReview.bind(reviewController)
);

export default router;