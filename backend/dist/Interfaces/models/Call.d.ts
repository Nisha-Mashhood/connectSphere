import { Document, Types } from "mongoose";
export interface Call extends Document {
    _id: Types.ObjectId;
    CallId: string;
    chatKey: string;
    callerId: string;
    recipientId: string;
    type: "audio" | "video";
    status: "incoming" | "answered" | "missed";
    timestamp: Date;
}
//# sourceMappingURL=Call.d.ts.map