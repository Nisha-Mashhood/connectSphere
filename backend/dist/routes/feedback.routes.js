import express from "express";
import { apiLimiter } from "../middlewares/ratelimit.middleware.js";
import { AuthMiddleware } from "../middlewares/auth.middleware.js";
import * as feedbackController from '../controllers/feeback.controller.js';
const router = express.Router();
const authMiddleware = new AuthMiddleware();
router.post("/send-feedback", [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], feedbackController.createFeedback);
router.get("/profile/:profileId/:profileType", [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], feedbackController.getFeedbackForProfile);
router.get("/get-feedbackByCollabId/:collabId", [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], feedbackController.getFeedBack);
router.patch("/toggle-visibility/:feedbackId", [apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin')], feedbackController.toggleFeedback);
router.get("/get-feedbackByMentorId/:mentorId", [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], feedbackController.getFeedBackByMentorId);
export default router;
//# sourceMappingURL=feedback.routes.js.map