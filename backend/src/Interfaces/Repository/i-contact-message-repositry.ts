import { IContactMessage } from '../Models/i-contact-message';

export interface IContactMessageRepository {
  createContactMessage(data: { name: string; email: string; message: string }): Promise<IContactMessage>;
  getAllContactMessages(params:{
  page?: number;
  limit?: number;
  search?: string;
  dateFilter?: "today" | "7days" | "30days" | "all";
}): Promise<{ messages: IContactMessage[]; total: number; page: number; pages: number }>;
  updateReplyStatus(contactMessageId: string): Promise<IContactMessage | null>;
}