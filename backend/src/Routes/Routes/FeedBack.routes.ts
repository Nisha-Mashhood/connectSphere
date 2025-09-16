import express from 'express';
import { FeedbackController } from '../../Controllers/FeedBack.controller';
import { apiLimiter } from '../../middlewares/ratelimit.middleware';
import { AuthMiddleware } from '../../middlewares/auth.middleware';
import { FEEDBACK_ROUTES } from '../Constants/Feedback.routes';

const router = express.Router();
const feedbackController = new FeedbackController();
const authMiddleware = new AuthMiddleware();


router.post(
  FEEDBACK_ROUTES.SendFeedback,
  [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus],
  feedbackController.createFeedback.bind(feedbackController)
);

router.get(
  FEEDBACK_ROUTES.GetFeedbackForProfile,
  [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus],
  feedbackController.getFeedbackForProfile.bind(feedbackController)
);

router.get(
  FEEDBACK_ROUTES.GetFeedbackByCollabId,
  [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus],
  feedbackController.getFeedbackByCollaborationId.bind(feedbackController)
);

router.patch(
  FEEDBACK_ROUTES.ToggleVisibility,
  [apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin')],
  feedbackController.toggleFeedback.bind(feedbackController)
);

router.get(
  FEEDBACK_ROUTES.GetFeedbackByMentorId,
  [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus],
  feedbackController.getFeedbackByMentorId.bind(feedbackController)
);

router.get(
  FEEDBACK_ROUTES.GetMentorFeedbacks,
  [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus],
  feedbackController.getMentorFeedbacks.bind(feedbackController)
);

router.get(
  FEEDBACK_ROUTES.GetUserFeedbacks,
  [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus],
  feedbackController.getUserFeedbacks.bind(feedbackController)
);

export default router;