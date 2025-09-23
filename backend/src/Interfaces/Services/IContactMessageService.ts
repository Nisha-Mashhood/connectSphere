import { IContactMessageDTO } from "../DTOs/IContactMessageDTO";

export interface IContactMessageService {
  createContactMessage: (data: { name: string; email: string; message: string }) => Promise<IContactMessageDTO>;
  getAllContactMessages: () => Promise<IContactMessageDTO[]>;
  sendReply: (contactMessageId: string, replyData: { email: string; replyMessage: string }) => Promise<IContactMessageDTO>;
}