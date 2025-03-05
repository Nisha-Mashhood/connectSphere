import { PushSubscription } from "../services/notification.service.js";
interface UserIds {
    userId: string;
    mentorUserId: string | null;
}
export declare const saveSubscription: (taskId: string, subscription: PushSubscription, metadata?: {
    userId?: string;
}) => Promise<import("mongoose").Document<unknown, {}, import("../models/task.modal.js").ITask> & import("../models/task.modal.js").ITask & Required<{
    _id: unknown;
}> & {
    __v: number;
}>;
export declare const getTasksForNotification: (taskId: string) => Promise<(import("mongoose").Document<unknown, {}, import("../models/task.modal.js").ITask> & import("../models/task.modal.js").ITask & Required<{
    _id: unknown;
}> & {
    __v: number;
}) | null>;
export declare const getAllTasksForNotification: () => Promise<(import("mongoose").Document<unknown, {}, import("../models/task.modal.js").ITask> & import("../models/task.modal.js").ITask & Required<{
    _id: unknown;
}> & {
    __v: number;
})[]>;
export declare const getGroupMembers: (groupId: string) => Promise<{
    userId: import("mongoose").Types.ObjectId;
    joinedAt: Date;
}[]>;
export declare const getMentorIdAndUserId: (collaborationId: string) => Promise<UserIds | null>;
export declare const getUserSubscription: (userId: string) => Promise<(import("mongoose").Document<unknown, {}, import("../models/task.modal.js").ITask> & import("../models/task.modal.js").ITask & Required<{
    _id: unknown;
}> & {
    __v: number;
}) | null>;
export {};
//# sourceMappingURL=notification.repositry.d.ts.map