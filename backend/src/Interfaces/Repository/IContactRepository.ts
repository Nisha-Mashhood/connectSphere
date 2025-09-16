import { IContact } from '../../Interfaces/Models/IContact';
import { PopulatedContact } from '../../Utils/Types/contact.types';

export interface IContactRepository {
  createContact(contactData: Partial<IContact>): Promise<IContact>;
  findContactById(contactId: string): Promise<IContact | null>;
  findContactByUsers(userId: string, targetUserId: string): Promise<IContact | null>;
  findContactsByUserId(userId?: string): Promise<PopulatedContact[]>;
  deleteContact(id: string, type: 'group' | 'user-mentor' | 'user-user', userId?: string): Promise<number>;
}