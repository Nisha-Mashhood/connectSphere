import { IContactMessage } from "../../Interfaces/Models/IContactMessage";

export interface IContactMessageService {
  createContactMessage: (data: { name: string; email: string; message: string }) => Promise<IContactMessage>;
  getAllContactMessages: () => Promise<IContactMessage[]>;
  sendReply: (contactMessageId: string, replyData: { email: string; replyMessage: string }) => Promise<IContactMessage>;
}