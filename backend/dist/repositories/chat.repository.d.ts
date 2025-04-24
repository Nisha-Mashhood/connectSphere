import { IChatMessage } from "../models/chat.model.js";
import mongoose from "mongoose";
export declare const saveChatMessage: (messageData: Partial<IChatMessage>) => Promise<IChatMessage>;
export declare const findChatMessageById: (messageId: string) => Promise<IChatMessage | null>;
export declare const findChatMessagesByCollaborationId: (collaborationId: string, page: number, limit: number) => Promise<(mongoose.Document<unknown, {}, IChatMessage> & IChatMessage & Required<{
    _id: unknown;
}> & {
    __v: number;
})[]>;
export declare const findChatMessagesByUserConnectionId: (userConnectionId: string, page: number, limit: number) => Promise<(mongoose.Document<unknown, {}, IChatMessage> & IChatMessage & Required<{
    _id: unknown;
}> & {
    __v: number;
})[]>;
export declare const findChatMessagesByGroupId: (groupId: string, page: number, limit: number) => Promise<(mongoose.Document<unknown, {}, IChatMessage> & IChatMessage & Required<{
    _id: unknown;
}> & {
    __v: number;
})[]>;
export declare const countMessagesByCollaborationId: (collaborationId: string) => Promise<number>;
export declare const countMessagesByUserConnectionId: (userConnectionId: string) => Promise<number>;
export declare const countMessagesByGroupId: (groupId: string) => Promise<number>;
export declare const countUnreadMessagesByGroupId: (groupId: string, userId: string) => Promise<number>;
export declare const countUnreadMessagesByCollaborationId: (collaborationId: string, userId: string) => Promise<number>;
export declare const countUnreadMessagesByUserConnectionId: (userConnectionId: string, userId: string) => Promise<number>;
export declare const markMessagesAsRead: (chatKey: string, userId: string, type: "group" | "user-mentor" | "user-user") => Promise<void>;
//# sourceMappingURL=chat.repository.d.ts.map