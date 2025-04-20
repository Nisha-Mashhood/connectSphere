import {
  findChatMessagesByCollaborationId,
  findChatMessagesByUserConnectionId,
  findChatMessagesByGroupId,
  countMessagesByCollaborationId,
  countMessagesByUserConnectionId,
  countMessagesByGroupId,
  countUnreadMessagesByGroupId,
  countUnreadMessagesByCollaborationId,
  countUnreadMessagesByUserConnectionId,
} from "../repositories/chat.repository.js";
import { IChatMessage } from "../models/chat.model.js";
import { findContactById, findContactsByUserId } from "../repositories/contacts.repository.js";
import mongoose from "mongoose";

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


export const getUnreadMessageCountsService = async (userId: string): Promise<{
  [key: string]: number;
}> => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid user ID: must be a 24 character hex string");
  }

  try {
    const contacts = await findContactsByUserId(userId);
    console.log("contacts from service : ",contacts);
    const unreadCounts: { [key: string]: number } = {};

    for (const contact of contacts) {
      let count = 0;
      try {
        if (contact.type === "group" && contact.groupId) {
          const groupIdStr = contact.groupId._id.toString();
          count = await countUnreadMessagesByGroupId(groupIdStr, userId);
          console.log(`Count of unread messages for group ${groupIdStr}: ${count}`);
          unreadCounts[`group_${groupIdStr}`] = count;
        } else if (contact.type === "user-mentor" && contact.collaborationId) {
          const collabIdStr = contact.collaborationId._id.toString();
          count = await countUnreadMessagesByCollaborationId(collabIdStr, userId);
          console.log(`Count of unread messages for collaboration ${collabIdStr}: ${count}`);
          unreadCounts[`user-mentor_${collabIdStr}`] = count;
        } else if (contact.type === "user-user" && contact.userConnectionId) {
          const userConnIdStr = contact.userConnectionId._id.toString();
          count = await countUnreadMessagesByUserConnectionId(userConnIdStr, userId);
          console.log(`Count of unread messages for user-user ${userConnIdStr}: ${count}`);
          unreadCounts[`user-user_${userConnIdStr}`] = count;
        } else {
          console.warn(`Skipping contact with invalid ID or type: ${JSON.stringify(contact)}`);
        }
      } catch (error: any) {
        console.error(`Error processing contact ${contact._id}: ${error.message}`);
        const id = contact.groupId?.toString() || contact.collaborationId?.toString() || contact.userConnectionId?.toString();
        unreadCounts[`${contact.type}_${id || "unknown"}`] = 0;
      }
    }

    console.log("Unread message count from service:", unreadCounts);
    return unreadCounts;
  } catch (error: any) {
    console.error("Service error:", error.message);
    throw new Error(`Service error fetching unread message counts: ${error.message}`);
  }
};