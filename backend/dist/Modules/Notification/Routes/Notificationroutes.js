import express from 'express';
import { NotificationController } from '../Controllers/Notificationcontroller.js';
import { AuthMiddleware } from '../../../middlewares/auth.middleware.js';
import { apiLimiter } from '../../../middlewares/ratelimit.middleware.js';
const router = express.Router();
const notificationController = new NotificationController();
const authMiddleware = new AuthMiddleware();
router.get('/getNotification', [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], notificationController.getNotifications.bind(notificationController));
router.patch('/:notificationId/read', [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], notificationController.markAsRead.bind(notificationController));
router.get('/unread-count', [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], notificationController.getUnreadCount.bind(notificationController));
export default router;
//# sourceMappingURL=Notificationroutes.js.map