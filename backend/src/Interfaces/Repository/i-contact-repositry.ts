import { IContact } from '../Models/i-contact';
import { PopulatedContact } from '../../Utils/types/contact-types';
import { ClientSession } from 'mongoose';

export interface IContactRepository {
  createContact(contactData: Partial<IContact>, session?: ClientSession): Promise<IContact>;
  findContactById(contactId: string): Promise<IContact | null>;
  findContactByUsers(userId: string, targetUserId: string): Promise<IContact | null>;
  findContactsByUserId(userId?: string): Promise<PopulatedContact[]>;
  deleteContact(id: string, type: 'group' | 'user-mentor' | 'user-user', userId?: string): Promise<number>;
}