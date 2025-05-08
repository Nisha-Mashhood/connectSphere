import { AppNotification } from "../models/notification.modal.js";
export interface TaskNotificationPayload {
    _id: string;
    userId: string;
    type: "message" | "incoming_call" | "missed_call" | "task_reminder";
    content: string;
    relatedId: string;
    senderId: string;
    status: "unread" | "read";
    createdAt: Date;
    updatedAt: Date;
    taskContext: {
        contextType: "profile" | "group" | "collaboration" | "userconnection";
        contextId: string;
    };
}
export declare const sendTaskNotification: (taskId: string, specificUserId?: string) => Promise<TaskNotificationPayload[]>;
export declare const checkAndSendNotifications: () => Promise<TaskNotificationPayload[]>;
export declare const sendNotification: (userId: string, notificationType: AppNotification["type"], senderId: string, relatedId: string, contentType?: string, callId?: string) => Promise<AppNotification>;
export declare const updateCallNotificationToMissed: (userId: string, callId: string, content: string) => Promise<AppNotification | null>;
export declare const getNotifications: (userId: string) => Promise<AppNotification[]>;
export declare const markNotificationAsRead: (notificationId: string) => Promise<AppNotification | null>;
export declare const getUnreadCount: (userId: string) => Promise<number>;
//# sourceMappingURL=notification.service.d.ts.map