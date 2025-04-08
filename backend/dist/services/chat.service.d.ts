import { IChatMessage } from "../models/chat.model.js";
export declare const getChatMessagesService: (contactId?: string, groupId?: string, page?: number, limit?: number) => Promise<{
    messages: IChatMessage[];
    total: number;
}>;
//# sourceMappingURL=chat.service.d.ts.map