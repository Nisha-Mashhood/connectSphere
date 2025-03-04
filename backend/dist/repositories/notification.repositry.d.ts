import { PushSubscription } from "../services/notification.service.js";
export declare const saveSubscription: (taskId: string, subscription: PushSubscription) => Promise<(import("mongoose").Document<unknown, {}, import("../models/task.modal.js").ITask> & import("../models/task.modal.js").ITask & Required<{
    _id: unknown;
}> & {
    __v: number;
}) | null>;
export declare const getTasksForNotification: () => Promise<(import("mongoose").Document<unknown, {}, import("../models/task.modal.js").ITask> & import("../models/task.modal.js").ITask & Required<{
    _id: unknown;
}> & {
    __v: number;
})[]>;
//# sourceMappingURL=notification.repositry.d.ts.map