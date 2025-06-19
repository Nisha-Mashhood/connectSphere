import express from "express";
import * as notificationController from "../controllers/notification.controller.js";
import { apiLimiter } from "../middlewares/ratelimit.middleware.js";
import { AuthMiddleware } from "../middlewares/auth.middleware.js";
const router = express.Router();
const authMiddleware = new AuthMiddleware();
// GET /notifications?userId=:userId
router.get("/getNotification", [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], notificationController.getNotifications);
// PATCH /notifications/:notificationId/read
router.patch("/:notificationId/read", [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], notificationController.markAsRead);
// GET /notifications/unread-count?userId=:userId
router.get("/unread-count", [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], notificationController.getUnreadCount);
export default router;
//# sourceMappingURL=notification.routes.js.map