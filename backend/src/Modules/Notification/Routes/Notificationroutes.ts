import express from 'express';
import { NotificationController } from '../Controllers/Notificationcontroller.js';
import { AuthMiddleware } from '../../../middlewares/auth.middleware.js';
import { apiLimiter } from '../../../middlewares/ratelimit.middleware.js';
import { NOTIFICATION_ROUTES } from '../Constant/Notification.routes.js';

const router = express.Router();
const notificationController = new NotificationController();
const authMiddleware = new AuthMiddleware();

// const NOTIFICATION_ROUTES = {
//   GetNotifications: '/getNotification',
//   MarkAsRead: '/:notificationId/read',
//   GetUnreadCount: '/unread-count',
// } as const;

router.get(
  NOTIFICATION_ROUTES.GetNotifications,
  [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus],
  notificationController.getNotifications.bind(notificationController)
);

router.patch(
  NOTIFICATION_ROUTES.MarkAsRead,
  [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus],
  notificationController.markAsRead.bind(notificationController)
);

router.get(
  NOTIFICATION_ROUTES.GetUnreadCount,
  [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus],
  notificationController.getUnreadCount.bind(notificationController)
);

export default router;