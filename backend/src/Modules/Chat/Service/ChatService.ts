import { Types } from 'mongoose';
import { BaseService } from '../../../core/Services/BaseService.js';
import { ChatRepository } from '../Repositry/ChatRepositry.js';
import { IChatMessage } from '../../../Interfaces/models/IChatMessage.js';
import { ContactRepository } from '../../Contact/Repositry/ContactRepositry.js';
import logger from '../../../core/Utils/Logger.js';

export class ChatService extends BaseService {
private chatRepo: ChatRepository;
private contactRepo: ContactRepository;
    constructor() {
        super();
        this.chatRepo = new ChatRepository();
        this.contactRepo = new ContactRepository();
      }

  async getChatMessages(
    contactId?: string,
    groupId?: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{ messages: IChatMessage[]; total: number }> {
    logger.debug(`Fetching chat messages for contact: ${contactId}, group: ${groupId}, page: ${page}, limit: ${limit}`);
    if (!contactId && !groupId) {
      this.throwError('Contact ID or Group ID is required to fetch chat messages');
    }
    if (contactId && groupId) {
      this.throwError('Provide only one of Contact ID or Group ID, not both');
    }

    let messages: IChatMessage[] = [];
    let total = 0;

    if (groupId) {
      this.checkData(groupId);
      messages = await this.chatRepo.findChatMessagesByGroupId(groupId, page, limit);
      total = await this.chatRepo.countMessagesByGroupId(groupId);
    } else if (contactId) {
      this.checkData(contactId);
      const contact = await this.contactRepo.findContactById(contactId);
      if (!contact) {
        this.throwError('Invalid contact');
      }

      if (contact.type === 'user-mentor' && contact.collaborationId) {
        messages = await this.chatRepo.findChatMessagesByCollaborationId(contact.collaborationId.toString(), page, limit);
        total = await this.chatRepo.countMessagesByCollaborationId(contact.collaborationId.toString());
      } else if (contact.type === 'user-user' && contact.userConnectionId) {
        messages = await this.chatRepo.findChatMessagesByUserConnectionId(contact.userConnectionId.toString(), page, limit);
        total = await this.chatRepo.countMessagesByUserConnectionId(contact.userConnectionId.toString());
      } else {
        this.throwError('No valid connection ID found for contact');
      }
    }

    return { messages: messages.reverse(), total };
  }

  async getUnreadMessageCounts(userId: string): Promise<{ [key: string]: number }> {
    logger.debug(`Fetching unread message counts for user: ${userId}`);
    this.checkData(userId);
    if (!Types.ObjectId.isValid(userId)) {
      this.throwError('Invalid user ID: must be a 24 character hex string');
    }

    const contacts = await this.contactRepo.findContactsByUserId(userId);
    logger.debug(`Found ${contacts.length} contacts for user: ${userId}`);
    const unreadCounts: { [key: string]: number } = {};

    for (const contact of contacts) {
      let count = 0;
      try {
        if (contact.type === 'group' && contact.groupId) {
          const groupIdStr = contact.groupId.toString();
          count = await this.chatRepo.countUnreadMessagesByGroupId(groupIdStr, userId);
          logger.debug(`Unread messages for group ${groupIdStr}: ${count}`);
          unreadCounts[`group_${groupIdStr}`] = count;
        } else if (contact.type === 'user-mentor' && contact.collaborationId) {
          const collabIdStr = contact.collaborationId.toString();
          count = await this.chatRepo.countUnreadMessagesByCollaborationId(collabIdStr, userId);
          logger.debug(`Unread messages for collaboration ${collabIdStr}: ${count}`);
          unreadCounts[`user-mentor_${collabIdStr}`] = count;
        } else if (contact.type === 'user-user' && contact.userConnectionId) {
          const userConnIdStr = contact.userConnectionId.toString();
          count = await this.chatRepo.countUnreadMessagesByUserConnectionId(userConnIdStr, userId);
          logger.debug(`Unread messages for user-user ${userConnIdStr}: ${count}`);
          unreadCounts[`user-user_${userConnIdStr}`] = count;
        } else {
          logger.warn(`Skipping contact with invalid ID or type: ${JSON.stringify(contact)}`);
        }
      } catch (error: any) {
        logger.warn(`Error processing contact ${contact._id}: ${error.message}`);
        const id = contact.groupId?.toString() || contact.collaborationId?.toString() || contact.userConnectionId?.toString();
        unreadCounts[`${contact.type}_${id || 'unknown'}`] = 0;
      }
    }

    logger.info(`Unread message counts: ${JSON.stringify(unreadCounts)}`);
    return unreadCounts;
  }
}