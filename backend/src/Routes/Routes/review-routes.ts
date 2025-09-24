import express from 'express';
import { apiLimiter } from '../../middlewares/ratelimit-middleware';
import { IAuthMiddleware } from '../../Interfaces/Middleware/i-auth-middleware';
import { REVIEW_ROUTES } from '../Constants/review-routes';
import container from "../../container";
import { IReviewController } from '../../Interfaces/Controller/i-review-controller';

const router = express.Router();
const reviewController = container.get<IReviewController>('IReviewController');
const authMiddleware = container.get<IAuthMiddleware>('IAuthMiddleware');


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