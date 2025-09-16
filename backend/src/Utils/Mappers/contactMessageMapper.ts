import { IContactMessage } from '../../Interfaces/Models/IContactMessage';
import { IContactMessageDTO } from '../../Interfaces/DTOs/IContactMessageDTO';

export function toContactMessageDTO(message: IContactMessage | null): IContactMessageDTO | null {
  if (!message) return null;

  return {
    id: message._id.toString(),
    contactMessageId: message.contactMessageId,
    name: message.name,
    email: message.email,
    message: message.message,
    givenReply: message.givenReply,
    createdAt: message.createdAt,
  };
}

export function toContactMessageDTOs(messages: IContactMessage[]): IContactMessageDTO[] {
  return messages.map(toContactMessageDTO).filter((dto): dto is IContactMessageDTO => dto !== null);
}
