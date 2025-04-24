import mongoose from 'mongoose';
import { ObjectId } from 'mongoose';
import { Schema, model } from 'mongoose';

export interface AppNotification {
    _id: string;
    userId: string | ObjectId;
    type: 'message' | 'incoming_call' | 'missed_call' | 'task_reminder';
    content: string;
    relatedId: string; // chatKey for messages/calls, taskId for tasks
    senderId: string | ObjectId;
    status: 'unread' | 'read';
    callId?: string;
    createdAt: Date;
    updatedAt: Date;
  }


const AppNotificationSchema = new Schema<AppNotification>({
  userId: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true, 
    index: true 
},
  type: {
    type: String,
    enum: ['message', 'incoming_call', 'missed_call', 'task_reminder'],
    required: true,
  },
  content: { 
    type: String, 
    required: true 
},
  relatedId: { 
    type: String, 
    required: true 
},
senderId: { 
  type: mongoose.Schema.Types.ObjectId, 
  ref: "User", 
  required: true 
},
  status: { 
    type: String, 
    enum: ['unread', 'read'], 
    default: 'unread' 
},
callId: { 
  type: String, 
  required: false 
}, // Unique identifier for calls
  createdAt: { 
    type: Date, 
    default: Date.now 
},
  updatedAt: { 
    type: Date, 
    default: Date.now 
},
});

AppNotificationSchema.index({ userId: 1, createdAt: -1 });

export const AppNotificationModel = model<AppNotification>('AppNotification', AppNotificationSchema);