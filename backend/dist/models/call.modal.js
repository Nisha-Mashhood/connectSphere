import { Schema, model } from 'mongoose';
const CallSchema = new Schema({
    chatKey: { type: String, required: true, index: true },
    callerId: { type: String, required: true },
    recipientId: { type: String, required: true },
    type: { type: String, enum: ['audio', 'video'], required: true },
    status: { type: String, enum: ['incoming', 'answered', 'missed'], required: true },
    timestamp: { type: Date, default: Date.now },
});
CallSchema.index({ chatKey: 1, timestamp: -1 });
export const CallModel = model('Call', CallSchema);
//# sourceMappingURL=call.modal.js.map