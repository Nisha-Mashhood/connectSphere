import express from 'express';
import container from "../../container";
import { FEEDBACK_ROUTES } from '../Constants/feedback-routes';
import { IFeedbackController } from '../../Interfaces/Controller/i-feedBack-controller';
import { apiLimiter } from '../../middlewares/ratelimit-middleware';
import { IAuthMiddleware } from '../../Interfaces/Middleware/i-auth-middleware';

const router = express.Router();
const feedbackController = container.get<IFeedbackController>('IFeedBackController');
const authMiddleware = container.get<IAuthMiddleware>('IAuthMiddleware');


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