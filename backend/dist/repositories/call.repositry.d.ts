import { Call } from "../Interfaces/models/Call.js";
export declare const create: (call: Omit<Call, "_id" | "CallId">) => Promise<Call>;
export declare const findByChatKey: (chatKey: string, limit?: number) => Promise<Call[]>;
export declare const findByUserId: (userId: string, limit?: number) => Promise<Call[]>;
//# sourceMappingURL=call.repositry.d.ts.map