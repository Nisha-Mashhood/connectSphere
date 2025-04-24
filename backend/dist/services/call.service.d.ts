import { Call } from "../models/call.modal.js";
export declare const logCall: (chatKey: string, callerId: string, recipientId: string, type: "audio" | "video", status: "incoming" | "answered" | "missed") => Promise<Call>;
export declare const getCallsByChatKey: (chatKey: string) => Promise<Call[]>;
export declare const getCallsByUserId: (userId: string) => Promise<Call[]>;
//# sourceMappingURL=call.service.d.ts.map