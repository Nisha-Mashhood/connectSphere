import express from "express";
import * as notificationController from "../controllers/notification.controller.js";
import { apiLimiter } from "../middlewares/ratelimit.middleware.js";
import { checkBlockedStatus, verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/subscribe/:currentUserId", notificationController.subscribeToNotifications);
// GET /notifications?userId=:userId
router.get("/getNotification", [apiLimiter, verifyToken, checkBlockedStatus], notificationController.getNotifications);

// PATCH /notifications/:notificationId/read
router.patch("/:notificationId/read", [apiLimiter, verifyToken, checkBlockedStatus], notificationController.markAsRead);

// GET /notifications/unread-count?userId=:userId
router.get("/unread-count", [apiLimiter, verifyToken, checkBlockedStatus], notificationController.getUnreadCount);
export default router;