import { IMessage } from '../../Interfaces/Models/IMessage';
import { IMessageDTO } from '../../Interfaces/DTOs/IMessageDTO';

export function toMessageDTO(message: IMessage | null): IMessageDTO | null {
  if (!message) return null;

  return {
    id: message._id.toString(),
    messageId: message.messageId,
    senderId: message.senderId.toString(),
    contactId: message.contactId.toString(),
    content: message.content,
    contentType: message.contentType,
    fileMetadata: message.fileMetadata ? {
      fileName: message.fileMetadata.fileName,
      fileSize: message.fileMetadata.fileSize,
      mimeType: message.fileMetadata.mimeType,
    } : undefined,
    isRead: message.isRead,
    createdAt: message.createdAt,
    updatedAt: message.updatedAt,
  };
}

export function toMessageDTOs(messages: IMessage[]): IMessageDTO[] {
  return messages.map(toMessageDTO).filter((dto): dto is IMessageDTO => dto !== null);
}
