import { IChatMessage } from "../Interfaces/models/IChatMessage.js";
export declare const getChatMessagesService: (contactId?: string, groupId?: string, page?: number, limit?: number) => Promise<{
    messages: IChatMessage[];
    total: number;
}>;
export declare const getUnreadMessageCountsService: (userId: string) => Promise<{
    [key: string]: number;
}>;
//# sourceMappingURL=chat.service.d.ts.map