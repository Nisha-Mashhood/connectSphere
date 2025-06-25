import express from 'express';
import { FeedbackController } from '../Controllers/FeedBackController.js';
import { apiLimiter } from '../../../middlewares/ratelimit.middleware.js';
import { AuthMiddleware } from '../../../middlewares/auth.middleware.js';
import { FEEDBACK_ROUTES } from '../Constant/Feedback.routes.js';
const router = express.Router();
const feedbackController = new FeedbackController();
const authMiddleware = new AuthMiddleware();
// const FEEDBACK_ROUTES = {
//   SendFeedback: '/send-feedback',
//   GetFeedbackForProfile: '/profile/:profileId/:profileType',
//   GetFeedbackByCollabId: '/get-feedbackByCollabId/:collabId',
//   ToggleVisibility: '/toggle-visibility/:feedbackId',
//   GetFeedbackByMentorId: '/get-feedbackByMentorId/:mentorId',
//   GetMentorFeedbacks: '/mentor/:mentorId',
//   GetUserFeedbacks: '/user/:userId',
// } as const;
router.post(FEEDBACK_ROUTES.SendFeedback, [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], feedbackController.createFeedback.bind(feedbackController));
router.get(FEEDBACK_ROUTES.GetFeedbackForProfile, [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], feedbackController.getFeedbackForProfile.bind(feedbackController));
router.get(FEEDBACK_ROUTES.GetFeedbackByCollabId, [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], feedbackController.getFeedbackByCollaborationId.bind(feedbackController));
router.patch(FEEDBACK_ROUTES.ToggleVisibility, [apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin')], feedbackController.toggleFeedback.bind(feedbackController));
router.get(FEEDBACK_ROUTES.GetFeedbackByMentorId, [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], feedbackController.getFeedbackByMentorId.bind(feedbackController));
router.get(FEEDBACK_ROUTES.GetMentorFeedbacks, [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], feedbackController.getMentorFeedbacks.bind(feedbackController));
router.get(FEEDBACK_ROUTES.GetUserFeedbacks, [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], feedbackController.getUserFeedbacks.bind(feedbackController));
export default router;
//# sourceMappingURL=FeedBackRoutes.js.map