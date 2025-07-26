import { Types } from "mongoose";
import { BaseService } from "../../../core/Services/BaseService";
import { ChatRepository } from "../Repositry/ChatRepositry";
import { IChatMessage } from "../../../Interfaces/models/IChatMessage";
import { ContactRepository } from "../../Contact/Repositry/ContactRepositry";
import { GroupRepository } from '../../Group/Repositry/GroupRepositry'
import logger from "../../../core/Utils/Logger";
import { IContact } from "../../../Interfaces/models/IContact";

export class ChatService extends BaseService {
  private chatRepo: ChatRepository;
  private contactRepo: ContactRepository;
  private groupRepo: GroupRepository;
  constructor() {
    super();
    this.chatRepo = new ChatRepository();
    this.contactRepo = new ContactRepository();
    this.groupRepo = new GroupRepository();
  }

   getChatMessages = async (
    contactId?: string,
    groupId?: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{ messages: IChatMessage[]; total: number }> => {
    try {
      logger.debug(
        `Fetching chat messages for contact: ${contactId}, group: ${groupId}, page: ${page}, limit: ${limit}`
      );
      if (!contactId && !groupId) {
        this.throwError("Contact ID or Group ID is required to fetch chat messages");
      }
      if (contactId && groupId) {
        this.throwError("Provide only one of Contact ID or Group ID, not both");
      }

      let messages: IChatMessage[] = [];
      let total = 0;

      if (groupId) {
        this.checkData(groupId);
        if (!Types.ObjectId.isValid(groupId)) {
          this.throwError("Invalid group ID: must be a 24 character hex string");
        }
        const group = await this.groupRepo.getGroupById(groupId);
        if (!group) {
          this.throwError("Invalid group ID");
        }
        messages = await this.chatRepo.findChatMessagesByGroupId(groupId, page, limit);
        total = await this.chatRepo.countMessagesByGroupId(groupId);
      } else if (contactId) {
        this.checkData(contactId);
        if (!Types.ObjectId.isValid(contactId)) {
          this.throwError("Invalid contact ID: must be a 24 character hex string");
        }
        const contact: IContact | null = await this.contactRepo.findContactById(contactId);
        if (!contact) {
          this.throwError("Invalid contact ID");
        }

        if (contact?.type === "user-mentor" && contact?.collaborationId) {
          messages = await this.chatRepo.findChatMessagesByCollaborationId(
            contact.collaborationId.toString(),
            page,
            limit
          );
          total = await this.chatRepo.countMessagesByCollaborationId(
            contact.collaborationId.toString()
          );
        } else if (contact?.type === "user-user" && contact.userConnectionId) {
          messages = await this.chatRepo.findChatMessagesByUserConnectionId(
            contact.userConnectionId.toString(),
            page,
            limit
          );
          total = await this.chatRepo.countMessagesByUserConnectionId(
            contact.userConnectionId.toString()
          );
        } else {
          this.throwError( "No valid connection ID found for contact");
        }
      }

      return { messages: messages.reverse(), total };
    } catch (error: any) {
      logger.error(`Error fetching chat messages: ${error.message}`);
      throw error;
    }
  }

  getUnreadMessageCounts = async (
    userId: string
  ): Promise<{ [key: string]: number }> => {
    try {
      logger.debug(`Fetching unread message counts for user: ${userId}`);
      this.checkData(userId);
      if (!Types.ObjectId.isValid(userId)) {
        this.throwError("Invalid user ID: must be a 24 character hex string");
      }

      const contacts = await this.contactRepo.findContactsByUserId(userId);
      logger.debug(`Found ${contacts.length} contacts for user: ${userId}`);
      const unreadCounts: { [key: string]: number } = {};

      if (contacts.length === 0) {
        logger.info(`No contacts found for user: ${userId}`);
        return unreadCounts;
      }

      for (const contact of contacts) {
        let count = 0;
        try {
          if (contact.type === "group" && contact.groupId) {
            const groupIdStr = contact.groupId._id?.toString();
            if (!groupIdStr) continue;
            count = await this.chatRepo.countUnreadMessagesByGroupId(groupIdStr, userId);
            unreadCounts[`group_${groupIdStr}`] = count;
          } else if (contact.type === "user-mentor" && contact.collaborationId) {
            const collabIdStr = contact.collaborationId._id?.toString();
            if (!collabIdStr) continue;
            count = await this.chatRepo.countUnreadMessagesByCollaborationId(collabIdStr, userId);
            unreadCounts[`user-mentor_${collabIdStr}`] = count;
          } else if (contact.type === "user-user" && contact.userConnectionId) {
            const userConnIdStr = contact.userConnectionId._id?.toString();
            if (!userConnIdStr) continue;
            count = await this.chatRepo.countUnreadMessagesByUserConnectionId(userConnIdStr, userId);
            unreadCounts[`user-user_${userConnIdStr}`] = count;
          }
        } catch (error: any) {
          logger.warn(`Skipping unread count for contact ${contact._id}: ${error.message}`);
          const id =
            contact.groupId?._id?.toString() ||
            contact.collaborationId?._id?.toString() ||
            contact.userConnectionId?._id?.toString() ||
            "unknown";
          unreadCounts[`${contact.type}_${id}`] = 0;
        }
      }

      logger.info(`Unread message counts: ${JSON.stringify(unreadCounts)}`);
      return unreadCounts;
    } catch (error: any) {
      logger.error(`Error fetching unread message counts for user ${userId}: ${error.message}`);
      throw error;
    }
  }
}
