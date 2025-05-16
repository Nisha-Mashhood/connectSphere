import express from "express";
import { apiLimiter } from "../middlewares/ratelimit.middleware.js";
import { authorize, checkBlockedStatus, verifyToken } from "../middlewares/auth.middleware.js";
import * as feedbackController from '../controllers/feeback.controller.js';
const router = express.Router();
router.post("/send-feedback", [apiLimiter, verifyToken, checkBlockedStatus], feedbackController.createFeedback);
router.get("/profile/:profileId/:profileType", [apiLimiter, verifyToken, checkBlockedStatus], feedbackController.getFeedbackForProfile);
router.get("/get-feedbackByCollabId/:collabId", [apiLimiter, verifyToken, checkBlockedStatus], feedbackController.getFeedBack);
router.patch("/toggle-visibility/:feedbackId", [apiLimiter, verifyToken, authorize('admin')], feedbackController.toggleFeedback);
router.get("/get-feedbackByMentorId/:mentorId", [apiLimiter, verifyToken, checkBlockedStatus], feedbackController.getFeedBackByMentorId);
export default router;
//# sourceMappingURL=feedback.routes.js.map