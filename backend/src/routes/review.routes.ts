import express from 'express';
import * as ReviewController from '../controllers/review.controller.js';
import { apiLimiter } from '../middlewares/ratelimit.middleware.js';
import { AuthMiddleware} from '../middlewares/auth.middleware.js';

const router = express.Router();
const authMiddleware = new AuthMiddleware();

router.post('/submit',[apiLimiter, authMiddleware.verifyToken,authMiddleware.checkBlockedStatus],  ReviewController.submitReview);
router.post('/skip',[apiLimiter, authMiddleware.verifyToken,authMiddleware.checkBlockedStatus],  ReviewController.skipReview);
router.get('/all', [apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin')],  ReviewController.getAllReviews);
router.patch('/approve/:reviewId',[apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin')],  ReviewController.approveReview);
router.patch('/select/:reviewId',[apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin')],  ReviewController.selectReview);
router.get('/selected',[apiLimiter, authMiddleware.verifyToken,authMiddleware.checkBlockedStatus], ReviewController.getSelectedReviews);
router.patch('/cancel/:reviewId',[apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin')],  ReviewController.cancelApproval);
router.patch('/deselect/:reviewId',[apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin')],  ReviewController.deselectReview);

export default router;