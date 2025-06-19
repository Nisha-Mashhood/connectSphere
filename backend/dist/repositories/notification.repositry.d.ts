import { AppNotification } from "../Interfaces/models/AppNotification.js";
interface UserIds {
    userId: string;
    mentorUserId: string | null;
}
export declare const getTasksForNotification: (taskId: string) => Promise<(import("mongoose").Document<unknown, {}, import("../Interfaces/models/ITask.js").ITask> & import("../Interfaces/models/ITask.js").ITask & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}) | null>;
export declare const getAllTasksForNotification: () => Promise<(import("mongoose").Document<unknown, {}, import("../Interfaces/models/ITask.js").ITask> & import("../Interfaces/models/ITask.js").ITask & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
})[]>;
export declare const getGroupMembers: (groupId: string) => Promise<{
    userId: import("mongoose").Types.ObjectId;
    joinedAt: Date;
}[]>;
export declare const getMentorIdAndUserId: (collaborationId: string) => Promise<UserIds | null>;
export declare const getConnectionUserIds: (connectionId: string) => Promise<{
    requester: string;
    recipient: string;
} | null>;
export declare const findTaskNotification: (userId: string, taskId: string, notificationDate?: string, notificationTime?: string) => Promise<AppNotification | null>;
export declare const updateNotificationStatus: (notificationId: string, status: string) => Promise<(import("mongoose").Document<unknown, {}, AppNotification> & AppNotification & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}) | null>;
export declare const updateTaskNotifications: (relatedId: string, notificationDate?: Date, notificationTime?: string) => Promise<import("mongoose").UpdateWriteOpResult | null>;
export declare const createNotification: (notification: Partial<AppNotification>) => Promise<AppNotification>;
export declare const findNotificationByUserId: (userId: string) => Promise<AppNotification[]>;
export declare const findNotificationByCallId: (userId: string, callId: string) => Promise<(import("mongoose").Document<unknown, {}, AppNotification> & AppNotification & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}) | null>;
export declare const updateNotificationToMissed: (userId: string, callId: string, content: string) => Promise<(import("mongoose").Document<unknown, {}, AppNotification> & AppNotification & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}) | null>;
export declare const markNotificationAsRead: (notificationId: string) => Promise<AppNotification | null>;
export declare const getNotificationUnreadCount: (userId: string) => Promise<number>;
export {};
//# sourceMappingURL=notification.repositry.d.ts.map