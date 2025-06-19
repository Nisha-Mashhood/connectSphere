import { BaseService } from '../../../core/Services/BaseService.js';
import { AppNotification as IAppNotification } from '../../../Interfaces/models/AppNotification.js';
import { Server } from 'socket.io';
export interface TaskNotificationPayload {
    _id: string;
    userId: string;
    type: 'message' | 'incoming_call' | 'missed_call' | 'task_reminder';
    content: string;
    relatedId: string;
    senderId: string;
    status: 'unread' | 'read';
    callId?: string;
    notificationDate?: string;
    notificationTime?: string;
    createdAt: Date;
    updatedAt: Date;
    taskContext?: {
        contextType: 'profile' | 'group' | 'collaboration' | 'userconnection';
        contextId: string;
    };
}
export declare class NotificationService extends BaseService {
    private notificationRepo;
    private userRepo;
    constructor();
    initializeSocket(_io: Server): void;
    sendTaskNotification(taskId: string, specificUserId?: string, notificationDate?: string, notificationTime?: string): Promise<TaskNotificationPayload[]>;
    checkAndSendNotifications(): Promise<TaskNotificationPayload[]>;
    sendNotification(userId: string, notificationType: IAppNotification['type'], senderId: string, relatedId: string, contentType?: string, callId?: string): Promise<IAppNotification>;
    updateCallNotificationToMissed(userId: string, callId: string, content: string): Promise<IAppNotification | null>;
    getNotifications(userId: string): Promise<IAppNotification[]>;
    markNotificationAsRead(notificationId: string): Promise<IAppNotification | null>;
    getUnreadCount(userId: string): Promise<number>;
}
//# sourceMappingURL=NotificationService.d.ts.map