import { Types, Model } from 'mongoose';
import { BaseRepository } from '../../../core/Repositries/BaseRepositry.js';
import { RepositoryError } from '../../../core/Utils/ErrorHandler.js';
import logger from '../../../core/Utils/Logger.js';
import Contact from '../../../models/contacts.model.js';
import { IContact } from '../../../Interfaces/models/IContact.js';
import { PopulatedContact } from '../Types/types.js';


export class ContactRepository extends BaseRepository<IContact> {
  constructor() {
    super(Contact as Model<IContact>);
  }

  private toObjectId(id?: string | Types.ObjectId): Types.ObjectId {
    if (!id) {
      logger.error('Missing ID');
      throw new RepositoryError('Invalid ID: ID is required');
    }
    const idStr = id instanceof Types.ObjectId ? id.toString() : id;
    if (!Types.ObjectId.isValid(idStr)) {
      logger.error(`Invalid ID: ${idStr}`);
      throw new RepositoryError('Invalid ID: must be a 24 character hex string');
    }
    return new Types.ObjectId(idStr);
  }

   createContact = async(contactData: Partial<IContact>): Promise<IContact> => {
    try {
      logger.debug(`Creating contact for user: ${contactData.userId}`);
      return await this.create({
        ...contactData,
        userId: contactData.userId ? this.toObjectId(contactData.userId) : undefined,
        targetUserId: contactData.targetUserId ? this.toObjectId(contactData.targetUserId) : undefined,
        collaborationId: contactData.collaborationId ? this.toObjectId(contactData.collaborationId) : undefined,
        userConnectionId: contactData.userConnectionId ? this.toObjectId(contactData.userConnectionId) : undefined,
        groupId: contactData.groupId ? this.toObjectId(contactData.groupId) : undefined,
      });
    } catch (error: any) {
      logger.error(`Error creating contact: ${error.message}`);
      throw new RepositoryError(`Error creating contact: ${error.message}`);
    }
  }

   findContactById = async(contactId: string): Promise<IContact | null> => {
    try {
      logger.debug(`Finding contact by ID: ${contactId}`);
      return await this.findById(this.toObjectId(contactId).toString());
    } catch (error: any) {
      logger.error(`Error finding contact by ID: ${error.message}`);
      throw new RepositoryError(`Error finding contact by ID: ${error.message}`);
    }
  }

   findContactByUsers = async(userId: string, targetUserId: string): Promise<IContact | null> => {
    try {
      logger.debug(`Finding contact for users: ${userId}, ${targetUserId}`);
      return await this.findOne({
        $or: [
          { userId: this.toObjectId(userId), targetUserId: this.toObjectId(targetUserId) },
          { userId: this.toObjectId(targetUserId), targetUserId: this.toObjectId(userId) },
        ],
        type: { $in: ['user-user', 'user-mentor'] },
      });
    } catch (error: any) {
      logger.error(`Error finding contact by user IDs: ${error.message}`);
      throw new RepositoryError(`Error finding contact by user IDs: ${error.message}`);
    }
  }

   findContactsByUserId = async(userId?: string): Promise<PopulatedContact[]> => {
    if (!userId) {
         throw new RepositoryError('User ID not provided');
      }
    try {
      logger.debug(`Finding contacts for user: ${userId}`);
      const uId = this.toObjectId(userId);
      return await this.model
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
    } catch (error: any) {
      logger.error(`Error finding contacts by user ID: ${error.message}`);
      throw new RepositoryError(`Error finding contacts by user ID: ${error.message}`);
    }
  }
}