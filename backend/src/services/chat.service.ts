import {
  findChatMessagesByCollaborationId,
  findChatMessagesByUserConnectionId,
  findChatMessagesByGroupId,
  countMessagesByCollaborationId,
  countMessagesByUserConnectionId,
  countMessagesByGroupId,
} from "../repositories/chat.repository.js";
import { IChatMessage } from "../models/chat.model.js";
import { findContactById } from "../repositories/contacts.repository.js";

export const getChatMessagesService = async (
  contactId?: string,
  groupId?: string,
  page: number = 1,
  limit: number = 10
): Promise<{ messages: IChatMessage[]; total: number }> => {
  try {
    if (!contactId && !groupId) {
      throw new Error("Contact ID or Group ID is required to fetch chat messages");
    }
    if (contactId && groupId) {
      throw new Error("Provide only one of Contact ID or Group ID, not both");
    }

    let messages: IChatMessage[] = [];
    let total = 0;

    if (groupId) {
      messages = await findChatMessagesByGroupId(groupId, page, limit);
      total = await countMessagesByGroupId(groupId);
    } else if (contactId) {
      const contact = await findContactById(contactId);
      if (!contact) throw new Error("Invalid contact");

      if (contact.type === "user-mentor" && contact.collaborationId) {
        messages = await findChatMessagesByCollaborationId(contact.collaborationId.toString(), page, limit);
        total = await countMessagesByCollaborationId(contact.collaborationId.toString());
      } else if (contact.type === "user-user" && contact.userConnectionId) {
        messages = await findChatMessagesByUserConnectionId(contact.userConnectionId.toString(), page, limit);
        total = await countMessagesByUserConnectionId(contact.userConnectionId.toString());
      } else {
        throw new Error("No valid connection ID found for contact");
      }
    }

    return { messages: messages.reverse(), total }; 
  } catch (error: any) {
    throw new Error(`Service error fetching chat messages: ${error.message}`);
  }
};