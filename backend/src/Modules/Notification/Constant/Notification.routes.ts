export const NOTIFICATION_ROUTES = {
  GetNotifications: '/getNotification',
  MarkAsRead: '/:notificationId/read',
  GetUnreadCount: '/unread-count',
} as const;