import express from "express";
import { apiLimiter } from "../middlewares/ratelimit.middleware.js";
import { AuthMiddleware } from "../middlewares/auth.middleware.js";
import * as ContactUsController from '../controllers/contactUs.controller.js'
const router = express.Router();
const authMiddleware = new AuthMiddleware();

router.post("/contact",[apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], ContactUsController.createContactMessage);
router.get("/messages", [apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin')], ContactUsController.getAllContactMessages);
router.post("/reply/:contactMessageId", [apiLimiter, authMiddleware.verifyToken , authMiddleware.authorize('admin')], ContactUsController.sendReply);

export default router;