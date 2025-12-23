import { inject, injectable } from 'inversify';
import { Types, Model, ClientSession } from 'mongoose';
import { BaseRepository } from '../core/repositries/base-repositry';
import { RepositoryError } from '../core/utils/error-handler';
import logger from '../core/utils/logger';
import Contact from '../Models/contacts-model';
import { IContact } from '../Interfaces/Models/i-contact';
import { PopulatedContact } from '../Utils/types/contact-types';
import { IContactRepository } from '../Interfaces/Repository/i-contact-repositry';
import { StatusCodes } from '../enums/status-code-enums';
import { IChatRepository } from '../Interfaces/Repository/i-chat-repositry';

@injectable()
export class ContactRepository extends BaseRepository<IContact> implements IContactRepository{
  private _chatRepo: IChatRepository;

  constructor(@inject('IChatRepository') chatRepository : IChatRepository) {
    super(Contact as Model<IContact>);
    this._chatRepo = chatRepository;
  }

  private toObjectId = (id?: string | Types.ObjectId): Types.ObjectId => {
    if (!id) {
      logger.warn('Missing ID when converting to ObjectId');
      throw new RepositoryError('Invalid ID: ID is required', StatusCodes.BAD_REQUEST);
    }
    const idStr = id instanceof Types.ObjectId ? id.toString() : id;
    if (!Types.ObjectId.isValid(idStr)) {
      logger.warn(`Invalid ObjectId format: ${idStr}`);
      throw new RepositoryError('Invalid ID: must be a 24 character hex string', StatusCodes.BAD_REQUEST);
    }
    return new Types.ObjectId(idStr);
  }

   public createContact = async (contactData: Partial<IContact>, session?: ClientSession): Promise<IContact> => {
    try {
      logger.debug(`Creating contact for user: ${contactData.userId}`);
      const contact = await this.create({
        ...contactData,
        userId: contactData.userId ? this.toObjectId(contactData.userId) : undefined,
        targetUserId: contactData.targetUserId ? this.toObjectId(contactData.targetUserId) : undefined,
        collaborationId: contactData.collaborationId ? this.toObjectId(contactData.collaborationId) : undefined,
        userConnectionId: contactData.userConnectionId ? this.toObjectId(contactData.userConnectionId) : undefined,
        groupId: contactData.groupId ? this.toObjectId(contactData.groupId) : undefined,
      },
    session
  );
      logger.info(`Contact created: ${contact._id}`);
      return contact;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error creating contact`, err);
      throw new RepositoryError('Error creating contact', StatusCodes.INTERNAL_SERVER_ERROR, err);
    }
  }

   public findContactById = async (contactId: string): Promise<IContact | null> => {
    try {
      logger.debug(`Finding contact by ID: ${contactId}`);
      const contact = await this.findById(contactId);
      logger.info(`Contact ${contact ? 'found' : 'not found'}: ${contactId}`);
      return contact;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error finding contact by ID ${contactId}`, err);
      throw new RepositoryError('Error finding contact by ID', StatusCodes.INTERNAL_SERVER_ERROR, err);
    }
  }

   public findContactByUsers = async (userId: string, targetUserId: string): Promise<IContact | null> => {
    try {
      logger.debug(`Finding contact for users: ${userId}, ${targetUserId}`);
      const contact = await this.findOne({
        $or: [
          { userId: this.toObjectId(userId), targetUserId: this.toObjectId(targetUserId) },
          { userId: this.toObjectId(targetUserId), targetUserId: this.toObjectId(userId) },
        ],
        type: { $in: ['user-user', 'user-mentor'] },
      });
      logger.info(`Contact ${contact ? 'found' : 'not found'} for users: ${userId}, ${targetUserId}`);
      return contact;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error finding contact for users ${userId}, ${targetUserId}`, err);
      throw new RepositoryError('Error finding contact by user IDs', StatusCodes.INTERNAL_SERVER_ERROR, err);
    }
  }

   public findContactsByUserId = async (userId?: string): Promise<PopulatedContact[]> => {
    if (!userId) {
      logger.warn('User ID not provided for finding contacts');
      throw new RepositoryError('User ID not provided', StatusCodes.BAD_REQUEST);
    }
    try {
      logger.debug(`Finding contacts for user: ${userId}`);
      const uId = this.toObjectId(userId);

      const contacts = await this.model
        .find({
          $or: [{ userId: uId }, { targetUserId: uId }],
        })
        .populate({
          path: 'userId',
          select: '_id name profilePic userId jobTitle',
          model: 'User',
        })
        .populate({
          path: 'targetUserId',
          select: '_id name profilePic userId jobTitle',
          model: 'User',
        })
        .populate({
          path: 'collaborationId',
          select: '_id mentorId userId startDate endDate price selectedSlot',
          model: 'Collaboration',
          populate: [
            { path: 'mentorId', select: 'userId', populate: { path: 'userId', select: '_id name profilePic jobTitle' } },
            { path: 'userId', select: '_id name profilePic jobTitle' },
          ],
        })
        .populate({
          path: 'userConnectionId',
          select: '_id requester recipient requestAcceptedAt',
          model: 'UserConnection',
          populate: [
            { path: 'requester', select: '_id name profilePic jobTitle' },
            { path: 'recipient', select: '_id name profilePic jobTitle' },
          ],
        })
        .populate({
          path: 'groupId',
          select: '_id name profilePic startDate adminId bio price maxMembers availableSlots members',
          model: 'Group',
          populate: [
            { path: 'adminId', select: '_id name profilePic' },
            { path: 'members.userId', select: '_id name profilePic' },
          ],
        })
        .lean()
        .exec() as unknown as PopulatedContact[];

      const contactsWithMessages = await Promise.all(
        contacts.map(async (contact) => {
          let lastMessage: { timestamp: Date } | null = null;
          if (contact.type === 'group' && contact.groupId?._id) {
            lastMessage = await this._chatRepo.findLatestMessageByGroupId(contact.groupId._id.toString());
          } else if (contact.type === 'user-mentor' && contact.collaborationId?._id) {
            lastMessage = await this._chatRepo.findLatestMessageByCollaborationId(contact.collaborationId._id.toString());
          } else if (contact.type === 'user-user' && contact.userConnectionId?._id) {
            lastMessage = await this._chatRepo.findLatestMessageByUserConnectionId(contact.userConnectionId._id.toString());
          }
          return { ...contact, lastMessage: lastMessage || undefined };
        })
      );

      const sortedContacts = contactsWithMessages.sort((a, b) => {
        const aTimestamp = a.lastMessage?.timestamp ? new Date(a.lastMessage.timestamp).getTime() : 0;
        const bTimestamp = b.lastMessage?.timestamp ? new Date(b.lastMessage.timestamp).getTime() : 0;
        return bTimestamp - aTimestamp || a._id.toString().localeCompare(b._id.toString());
      });
      return sortedContacts;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error finding contacts for user ${userId}`, err);
      throw new RepositoryError('Error finding contacts by user ID', StatusCodes.INTERNAL_SERVER_ERROR, err);
    }
  }

  public deleteContact = async (
    id: string,
    type: 'group' | 'user-mentor' | 'user-user',
    userId?: string
  ): Promise<number> => {
    try {
      logger.debug(`Deleting contact for id: ${id}, type: ${type}${userId ? `, userId: ${userId}` : ''}`);
      const query: Record<string, any> = { type };
      if (type === 'group') {
        query.groupId = this.toObjectId(id);
        if (userId) {
          query.userId = this.toObjectId(userId);
        }
      } else if (type === 'user-mentor') {
        query.collaborationId = this.toObjectId(id);
      } else if (type === 'user-user') {
        query.userConnectionId = this.toObjectId(id);
      } else {
        logger.warn(`Invalid contact type: ${type}`);
        throw new RepositoryError(`Invalid contact type: ${type}`, StatusCodes.BAD_REQUEST);
      }

      const result = await this.model.deleteMany(query).exec();
      const deletedCount = result.deletedCount || 0;
      logger.info(`Deleted ${deletedCount} contact(s) for id: ${id}, type: ${type}${userId ? `, userId: ${userId}` : ''}`);
      return deletedCount;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error deleting contact for id: ${id}, type: ${type}`, err);
      throw new RepositoryError('Error deleting contact', StatusCodes.INTERNAL_SERVER_ERROR, err);
    }
  }
}