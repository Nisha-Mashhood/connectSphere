import express from 'express';
import { NotificationController } from '../../Controllers/Notification.controller';
import { AuthMiddleware } from '../../middlewares/auth.middleware';
import { apiLimiter } from '../../middlewares/ratelimit.middleware';
import { NOTIFICATION_ROUTES } from '../Constants/Notification.routes';

const router = express.Router();
const notificationController = new NotificationController();
const authMiddleware = new AuthMiddleware();


router.get(
  NOTIFICATION_ROUTES.GetNotifications,
  [apiLimiter, authMiddleware.verifyToken],
  notificationController.getNotifications.bind(notificationController)
);

router.patch(
  NOTIFICATION_ROUTES.MarkAsRead,
  [apiLimiter, authMiddleware.verifyToken],
  notificationController.markAsRead.bind(notificationController)
);


router.get(
  NOTIFICATION_ROUTES.GetUnreadCount,
  [apiLimiter, authMiddleware.verifyToken],
  notificationController.getUnreadCount.bind(notificationController)
);

export default router;