import * as notificationService from "../services/notification.service.js";
export const getNotifications = async (req, res) => {
    const userId = req.query.userId;
    if (!userId) {
        res.status(400).json({ error: 'userId is required' });
        return;
    }
    const notifications = await notificationService.getNotifications(userId);
    res.json(notifications);
};
export const markAsRead = async (req, res) => {
    const { notificationId } = req.params;
    const notification = await notificationService.markNotificationAsRead(notificationId);
    if (!notification) {
        res.status(404).json({ error: 'Notification not found' });
        return;
    }
    res.json(notification);
};
export const getUnreadCount = async (req, res) => {
    const userId = req.query.userId;
    if (!userId) {
        res.status(400).json({ error: 'userId is required' });
        return;
    }
    const count = await notificationService.getUnreadCount(userId);
    res.json({ count });
};
//# sourceMappingURL=notification.controller.js.map