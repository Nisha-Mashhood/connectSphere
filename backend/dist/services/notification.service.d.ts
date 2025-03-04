export interface PushSubscription {
    endpoint: string;
    keys: {
        auth: string;
        p256dh: string;
    };
}
export declare const storeSubscription: (taskId: string, subscription: PushSubscription) => Promise<(import("mongoose").Document<unknown, {}, import("../models/task.modal.js").ITask> & import("../models/task.modal.js").ITask & Required<{
    _id: unknown;
}> & {
    __v: number;
}) | null>;
export declare const sendPushNotification: (message: string) => Promise<void>;
//# sourceMappingURL=notification.service.d.ts.map