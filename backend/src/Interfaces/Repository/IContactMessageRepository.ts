import { IContactMessage } from '../../Interfaces/Models/IContactMessage';

export interface IContactMessageRepository {
  createContactMessage(data: { name: string; email: string; message: string }): Promise<IContactMessage>;
  getAllContactMessages(): Promise<IContactMessage[]>;
  updateReplyStatus(contactMessageId: string): Promise<IContactMessage | null>;
}