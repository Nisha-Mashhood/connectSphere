import { BaseRepository } from '../../../core/Repositries/BaseRepositry.js';
import { IChatMessage } from '../../../Interfaces/models/IChatMessage.js';
export declare class ChatRepository extends BaseRepository<IChatMessage> {
    constructor();
    private toObjectId;
    saveChatMessage: (messageData: Partial<IChatMessage>) => Promise<IChatMessage>;
    findChatMessageById: (messageId: string) => Promise<IChatMessage | null>;
    findChatMessagesByCollaborationId: (collaborationId: string, page: number, limit: number) => Promise<IChatMessage[]>;
    findChatMessagesByUserConnectionId: (userConnectionId: string, page: number, limit: number) => Promise<IChatMessage[]>;
    findChatMessagesByGroupId: (groupId: string, page: number, limit: number) => Promise<IChatMessage[]>;
    countMessagesByCollaborationId: (collaborationId: string) => Promise<number>;
    countMessagesByUserConnectionId: (userConnectionId: string) => Promise<number>;
    countMessagesByGroupId: (groupId: string) => Promise<number>;
    countUnreadMessagesByGroupId: (groupId: string, userId: string) => Promise<number>;
    countUnreadMessagesByCollaborationId: (collaborationId: string, userId: string) => Promise<number>;
    countUnreadMessagesByUserConnectionId: (userConnectionId: string, userId: string) => Promise<number>;
    markMessagesAsRead: (chatKey: string, userId: string, type: "group" | "user-mentor" | "user-user") => Promise<string[]>;
}
//# sourceMappingURL=ChatRepositry.d.ts.map