import { NotificationService } from '../Service/NotificationService.js';
import logger from '../../../core/Utils/Logger.js';
export class NotificationController {
    notificationService;
    constructor() {
        this.notificationService = new NotificationService();
    }
    getNotifications = async (req, res) => {
        try {
            const userId = req.query.userId;
            logger.debug(`Fetching notifications for user: ${userId}`);
            if (!userId) {
                logger.error('Missing userId');
                throw new Error('userId is required');
            }
            const notifications = await this.notificationService.getNotifications(userId);
            res.status(200).json({
                success: true,
                message: 'Notifications fetched successfully',
                data: notifications,
            });
        }
        catch (error) {
            logger.error(`Error fetching notifications: ${error.message}`);
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to fetch notifications',
            });
        }
    };
    markAsRead = async (req, res) => {
        try {
            const { notificationId } = req.params;
            logger.debug(`Marking notification as read: ${notificationId}`);
            const notification = await this.notificationService.markNotificationAsRead(notificationId);
            if (!notification) {
                logger.warn(`Notification not found: ${notificationId}`);
                res.status(404).json({
                    success: false,
                    message: 'Notification not found',
                });
                return;
            }
            res.status(200).json({
                success: true,
                message: 'Notification marked as read',
                data: notification,
            });
        }
        catch (error) {
            logger.error(`Error marking notification as read: ${error.message}`);
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to mark notification as read',
            });
        }
    };
    getUnreadCount = async (req, res) => {
        try {
            const userId = req.query.userId;
            logger.debug(`Fetching unread notification count for user: ${userId}`);
            if (!userId) {
                logger.error('Missing userId');
                throw new Error('userId is required');
            }
            const count = await this.notificationService.getUnreadCount(userId);
            res.status(200).json({
                success: true,
                message: 'Unread notification count fetched successfully',
                data: { count },
            });
        }
        catch (error) {
            logger.error(`Error fetching unread notification count: ${error.message}`);
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to fetch unread notification count',
            });
        }
    };
}
//# sourceMappingURL=Notificationcontroller.js.map