import { Schema, model } from 'mongoose';

export interface Call {
    _id: string;
    chatKey: string; // e.g., user-user_<userConnectionId>, user-mentor_<collaborationId>
    callerId: string;
    recipientId: string;
    type: 'audio' | 'video';
    status: 'incoming' | 'answered' | 'missed';
    timestamp: Date;
  }

const CallSchema = new Schema<Call>({
  chatKey: { type: String, required: true, index: true },
  callerId: { type: String, required: true },
  recipientId: { type: String, required: true },
  type: { type: String, enum: ['audio', 'video'], required: true },
  status: { type: String, enum: ['incoming', 'answered', 'missed'], required: true },
  timestamp: { type: Date, default: Date.now },
});

CallSchema.index({ chatKey: 1, timestamp: -1 });

export const CallModel = model<Call>('Call', CallSchema);