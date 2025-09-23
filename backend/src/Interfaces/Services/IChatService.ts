import { IChatMessageDTO } from "../DTOs/IChatMessageDTO";

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
}