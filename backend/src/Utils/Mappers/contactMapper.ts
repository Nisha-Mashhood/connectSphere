import { IContact } from '../../Interfaces/Models/IContact';
import { IContactDTO } from '../../Interfaces/DTOs/IContactDTO';

export function toContactDTO(contact: IContact | null): IContactDTO | null {
  if (!contact) return null;

  return {
    id: contact._id.toString(),
    contactId: contact.contactId,
    userId: contact.userId.toString(),
    targetUserId: contact.targetUserId?.toString(),
    collaborationId: contact.collaborationId?.toString(),
    userConnectionId: contact.userConnectionId?.toString(),
    groupId: contact.groupId?.toString(),
    type: contact.type,
    createdAt: contact.createdAt,
    updatedAt: contact.updatedAt,
  };
}

export function toContactDTOs(contacts: IContact[]): IContactDTO[] {
  return contacts.map(toContactDTO).filter((dto): dto is IContactDTO => dto !== null);
}
