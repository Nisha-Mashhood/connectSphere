import { IContactMessageDTO } from "../DTOs/i-contact-message-dto";

export interface IContactMessageService {
  createContactMessage: (data: { name: string; email: string; message: string }) => Promise<IContactMessageDTO>;
  getAllContactMessages: () => Promise<IContactMessageDTO[]>;
  sendReply: (contactMessageId: string, replyData: { email: string; replyMessage: string }) => Promise<IContactMessageDTO>;
}