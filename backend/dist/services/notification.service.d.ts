import { AppNotification } from "../models/notification.modal.js";
export interface PushSubscription {
    endpoint: string;
    keys: {
        auth: string;
        p256dh: string;
    };
}
export declare const storeSubscription: (currentUserId: string, taskId: string, subscription: PushSubscription) => Promise<import("mongoose").Document<unknown, {}, import("../models/task.modal.js").ITask> & import("../models/task.modal.js").ITask & Required<{
    _id: unknown;
}> & {
    __v: number;
}>;
export declare const sendPushNotification: (taskId: string, message?: string, specificUserId?: string) => Promise<void>;
export declare const sendNotification: (userId: string, notificationType: AppNotification["type"], senderId: string, relatedId: string, contentType?: string, callId?: string) => Promise<AppNotification>;
export declare const updateCallNotificationToMissed: (userId: string, callId: string, content: string) => Promise<AppNotification | null>;
export declare const getNotifications: (userId: string) => Promise<AppNotification[]>;
export declare const markNotificationAsRead: (notificationId: string) => Promise<AppNotification | null>;
export declare const getUnreadCount: (userId: string) => Promise<number>;
//# sourceMappingURL=notification.service.d.ts.map