import express from "express";
import { apiLimiter } from "../middlewares/ratelimit.middleware.js";
import { authorize, checkBlockedStatus, verifyToken } from "../middlewares/auth.middleware.js";
import * as ContactUsController from '../controllers/contactUs.controller.js';
const router = express.Router();
router.post("/contact", [apiLimiter, verifyToken, checkBlockedStatus], ContactUsController.createContactMessage);
router.get("/messages", [apiLimiter, verifyToken, authorize('admin')], ContactUsController.getAllContactMessages);
router.post("/reply/:contactMessageId", [apiLimiter, verifyToken, authorize('admin')], ContactUsController.sendReply);
export default router;
//# sourceMappingURL=contactUs.routes.js.map