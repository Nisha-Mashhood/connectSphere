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
//# sourceMappingURL=notification.service.d.ts.map