import mongoose from 'mongoose';
import { ObjectId } from 'mongoose';
export interface AppNotification {
    _id: string;
    userId: string | ObjectId;
    type: 'message' | 'incoming_call' | 'missed_call' | 'task_reminder';
    content: string;
    relatedId: string;
    senderId: string | ObjectId;
    status: 'unread' | 'read';
    callId?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const AppNotificationModel: mongoose.Model<AppNotification, {}, {}, {}, mongoose.Document<unknown, {}, AppNotification> & AppNotification & Required<{
    _id: string;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=notification.modal.d.ts.map