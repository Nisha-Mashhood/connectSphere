import { LastMessageSummary } from "../../Utils/types/contact-types";
import { IChatMessageDTO } from "../DTOs/i-chat-message-dto";

export interface IChatService {
  getChatMessages: (
    contactId?: string,
    groupId?: string,
    page?: number,
    limit?: number
  ) => Promise<{ messages: IChatMessageDTO[]; total: number }>;
  getUnreadMessageCounts: (userId: string) => Promise<{ [key: string]: number }>;
  uploadAndSaveMessage(data: {
    senderId: string;
    targetId: string;
    type: 'user-mentor' | 'user-user' | 'group';
    collaborationId?: string;
    userConnectionId?: string;
    groupId?: string;
    file: {
      path: string;
      size?: number;
      originalname?: string;
      mimetype?: string;
    };
  }): Promise<{ url: string; thumbnailUrl?: string; messageId: string }>;
  getLastMessageSummaries: (userId: string) => Promise<{ [chatKey: string]: LastMessageSummary }>
}