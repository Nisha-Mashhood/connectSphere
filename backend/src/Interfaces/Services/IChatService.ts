import { IChatMessage } from "../../Interfaces/Models/IChatMessage";

export interface IChatService {
  getChatMessages: (
    contactId?: string,
    groupId?: string,
    page?: number,
    limit?: number
  ) => Promise<{ messages: IChatMessage[]; total: number }>;
  getUnreadMessageCounts: (userId: string) => Promise<{ [key: string]: number }>;
}