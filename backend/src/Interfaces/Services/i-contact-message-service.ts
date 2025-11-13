import { IContactMessageDTO } from "../DTOs/i-contact-message-dto";

export interface IContactMessageService {
  createContactMessage: (data: { name: string; email: string; message: string }) => Promise<IContactMessageDTO>;
  getAllContactMessages: (params:{
  page?: number;
  limit?: number;
  search?: string;
  dateFilter?: "today" | "7days" | "30days" | "all"
}) => Promise<{
  messages: IContactMessageDTO[];
  total: number;
  page: number;
  pages: number;
}>;
  sendReply: (contactMessageId: string, replyData: { email: string; replyMessage: string }) => Promise<IContactMessageDTO>;
}