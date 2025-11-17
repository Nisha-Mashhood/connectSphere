import { IContactMessage } from '../../Interfaces/Models/i-contact-message';
import { IContactMessageDTO } from '../../Interfaces/DTOs/i-contact-message-dto';
import logger from '../../core/utils/logger';

export function toContactMessageDTO(contactMessage: IContactMessage | null): IContactMessageDTO | null {
  if (!contactMessage) {
    logger.warn('Attempted to map null contact message to DTO');
    return null;
  }

  return {
    id: contactMessage._id.toString(),
    contactMessageId: contactMessage.contactMessageId,
    name: contactMessage.name,
    email: contactMessage.email,
    message: contactMessage.message,
    createdAt: contactMessage.createdAt,
    givenReply: contactMessage.givenReply,
  };
}

export function toContactMessageDTOs(contactMessages: IContactMessage[]): IContactMessageDTO[] {
  return contactMessages
    .map(toContactMessageDTO)
    .filter((dto): dto is IContactMessageDTO => dto !== null);
}