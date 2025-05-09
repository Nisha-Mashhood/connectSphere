import express from "express";
import { apiLimiter } from "../middlewares/ratelimit.middleware.js";
import { checkBlockedStatus, verifyToken } from "../middlewares/auth.middleware.js";
import * as feedbackController from '../controllers/feeback.controller.js'
const router = express.Router();

router.post("/send-feedback",[apiLimiter, verifyToken, checkBlockedStatus], feedbackController.createFeedback);
// router.get("/get-feedback", [apiLimiter, verifyToken, checkBlockedStatus], feedbackController.getFeedbackOnRoles);

export default router;