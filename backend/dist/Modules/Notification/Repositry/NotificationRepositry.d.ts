import { Types } from 'mongoose';
import { BaseRepository } from '../../../core/Repositries/BaseRepositry.js';
import { AppNotification as IAppNotification } from '../../../Interfaces/models/AppNotification.js';
import { ITask } from '../../../Interfaces/models/ITask.js';
interface UserIds {
    userId: string;
    mentorUserId: string | null;
}
export declare class NotificationRepository extends BaseRepository<IAppNotification> {
    constructor();
    private toObjectId;
    getTasksForNotification(taskId: string): Promise<ITask | null>;
    getAllTasksForNotification(): Promise<ITask[]>;
    getGroupMembers(groupId: string): Promise<Types.ObjectId[]>;
    getMentorIdAndUserId(collaborationId: string): Promise<UserIds | null>;
    getConnectionUserIds(connectionId: string): Promise<{
        requester: string;
        recipient: string;
    } | null>;
    findTaskNotification(userId: string, taskId: string, notificationDate?: string, notificationTime?: string): Promise<IAppNotification | null>;
    updateNotificationStatus(notificationId: string, status: 'unread' | 'read'): Promise<IAppNotification | null>;
    updateTaskNotifications(relatedId: string, notificationDate?: Date, notificationTime?: string): Promise<{
        modifiedCount: number;
    }>;
    createNotification(notification: Partial<IAppNotification>): Promise<IAppNotification>;
    findNotificationByUserId(userId: string): Promise<IAppNotification[]>;
    findNotificationByCallId(userId: string, callId: string): Promise<IAppNotification | null>;
    updateNotificationToMissed(userId: string, callId: string, content: string): Promise<IAppNotification | null>;
    markNotificationAsRead(notificationId: string): Promise<IAppNotification | null>;
    getNotificationUnreadCount(userId: string): Promise<number>;
}
export {};
//# sourceMappingURL=NotificationRepositry.d.ts.map