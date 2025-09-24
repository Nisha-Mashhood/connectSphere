import express from 'express';
import { IAuthMiddleware } from '../../Interfaces/Middleware/i-auth-middleware';
import { apiLimiter } from '../../middlewares/ratelimit-middleware';
import { NOTIFICATION_ROUTES } from '../Constants/notification-routes';
import container from "../../container";
import { INotificationController } from '../../Interfaces/Controller/i-notification-controller';

const router = express.Router();
const notificationController = container.get<INotificationController>('INotificationController');
const authMiddleware = container.get<IAuthMiddleware>('IAuthMiddleware');


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