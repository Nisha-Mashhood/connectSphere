import express from 'express';
import { ReviewController } from '../Controllers/ReviewController.js';
import { apiLimiter } from '../../../middlewares/ratelimit.middleware.js';
import { AuthMiddleware } from '../../../middlewares/auth.middleware.js';
import { REVIEW_ROUTES } from '../Constant/Review.routes.js';
const router = express.Router();
const reviewController = new ReviewController();
const authMiddleware = new AuthMiddleware();
// const REVIEW_ROUTES = {
//   SubmitReview: '/submit',
//   SkipReview: '/skip',
//   GetAllReviews: '/all',
//   ApproveReview: '/approve/:reviewId',
//   SelectReview: '/select/:reviewId',
//   GetSelectedReviews: '/selected',
//   CancelApproval: '/cancel/:reviewId',
//   DeselectReview: '/deselect/:reviewId',
// } as const;
router.post(REVIEW_ROUTES.SubmitReview, [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], reviewController.submitReview.bind(reviewController));
router.post(REVIEW_ROUTES.SkipReview, [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], reviewController.skipReview.bind(reviewController));
router.get(REVIEW_ROUTES.GetAllReviews, [apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin')], reviewController.getAllReviews.bind(reviewController));
router.patch(REVIEW_ROUTES.ApproveReview, [apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin')], reviewController.approveReview.bind(reviewController));
router.patch(REVIEW_ROUTES.SelectReview, [apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin')], reviewController.selectReview.bind(reviewController));
router.get(REVIEW_ROUTES.GetSelectedReviews, [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], reviewController.getSelectedReviews.bind(reviewController));
router.patch(REVIEW_ROUTES.CancelApproval, [apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin')], reviewController.cancelApproval.bind(reviewController));
router.patch(REVIEW_ROUTES.DeselectReview, [apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin')], reviewController.deselectReview.bind(reviewController));
export default router;
//# sourceMappingURL=ReviewRoutes.js.map