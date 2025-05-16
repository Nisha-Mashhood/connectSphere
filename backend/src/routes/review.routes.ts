import express from 'express';
import * as ReviewController from '../controllers/review.controller.js';
import { apiLimiter } from '../middlewares/ratelimit.middleware.js';
import { authorize, checkBlockedStatus, verifyToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/submit',[apiLimiter, verifyToken,checkBlockedStatus],  ReviewController.submitReview);
router.post('/skip',[apiLimiter, verifyToken,checkBlockedStatus],  ReviewController.skipReview);
router.get('/all', [apiLimiter, verifyToken, authorize('admin')],  ReviewController.getAllReviews);
router.patch('/approve/:reviewId',[apiLimiter, verifyToken, authorize('admin')],  ReviewController.approveReview);
router.patch('/select/:reviewId',[apiLimiter, verifyToken, authorize('admin')],  ReviewController.selectReview);
router.get('/selected',[apiLimiter, verifyToken,checkBlockedStatus], ReviewController.getSelectedReviews);
router.patch('/cancel/:reviewId',[apiLimiter, verifyToken, authorize('admin')],  ReviewController.cancelApproval);
router.patch('/deselect/:reviewId',[apiLimiter, verifyToken, authorize('admin')],  ReviewController.deselectReview);

export default router;