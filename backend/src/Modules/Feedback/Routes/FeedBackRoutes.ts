import express from 'express';
import { FeedbackController } from '../Controllers/FeedBackController.js';
import { apiLimiter } from '../../../middlewares/ratelimit.middleware.js';
import { AuthMiddleware } from '../../../middlewares/auth.middleware.js';

const router = express.Router();
const feedbackController = new FeedbackController();
const authMiddleware = new AuthMiddleware();

router.post(
  '/send-feedback',
  [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus],
  feedbackController.createFeedback.bind(feedbackController)
);

router.get(
  '/profile/:profileId/:profileType',
  [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus],
  feedbackController.getFeedbackForProfile.bind(feedbackController)
);

router.get(
  '/get-feedbackByCollabId/:collabId',
  [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus],
  feedbackController.getFeedbackByCollaborationId.bind(feedbackController)
);

router.patch(
  '/toggle-visibility/:feedbackId',
  [apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin')],
  feedbackController.toggleFeedback.bind(feedbackController)
);

router.get(
  '/get-feedbackByMentorId/:mentorId',
  [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus],
  feedbackController.getFeedbackByMentorId.bind(feedbackController)
);

router.get(
  '/mentor/:mentorId',
  [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus],
  feedbackController.getMentorFeedbacks.bind(feedbackController)
);

router.get(
  '/user/:userId',
  [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus],
  feedbackController.getUserFeedbacks.bind(feedbackController)
);

export default router;