import express from "express";
import { apiLimiter } from "../middlewares/ratelimit.middleware.js";
import { checkBlockedStatus, verifyToken } from "../middlewares/auth.middleware.js";
import * as collaborationController from '../controllers/collaboration.controller.js';
const router = express.Router();
router.post("/create-mentorprofile", [apiLimiter, verifyToken, checkBlockedStatus], collaborationController.TemporaryRequestController);
router.get("/get-mentor-requests", [apiLimiter, verifyToken, checkBlockedStatus], collaborationController.getMentorRequestsController);
router.post("/accept-request/:id", [apiLimiter, verifyToken, checkBlockedStatus], collaborationController.acceptRequestController);
router.post("/reject-request/:id", [apiLimiter, verifyToken, checkBlockedStatus], collaborationController.rejectRequestController);
router.get("/get-user-requests/:id", [apiLimiter, verifyToken, checkBlockedStatus], collaborationController.getRequsetForUserController);
router.post("/process-payment", [apiLimiter, verifyToken, checkBlockedStatus], collaborationController.makeStripePaymentController);
export default router;
//# sourceMappingURL=collaboration.routes.js.map