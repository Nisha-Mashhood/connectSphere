import Contact, { IContact } from "../models/contacts.model.js";
import mongoose from "mongoose";

// Utility to convert string to ObjectId
const toObjectId = (id: string) => new mongoose.Types.ObjectId(id);

// Create a single Contact document
export const createContact = async (contactData: Partial<IContact>): Promise<IContact> => {
  try {
    const contact = new Contact({
      ...contactData,
      userId: contactData.userId && typeof contactData.userId === "string" ? toObjectId(contactData.userId) : contactData.userId,
      targetUserId: contactData.targetUserId && typeof contactData.targetUserId === "string" ? toObjectId(contactData.targetUserId) : contactData.targetUserId,
      collaborationId: contactData.collaborationId && typeof contactData.collaborationId === "string" ? toObjectId(contactData.collaborationId) : contactData.collaborationId,
      userConnectionId: contactData.userConnectionId && typeof contactData.userConnectionId === "string" ? toObjectId(contactData.userConnectionId) : contactData.userConnectionId,
      groupId: contactData.groupId && typeof contactData.groupId === "string" ? toObjectId(contactData.groupId) : contactData.groupId,
    });
    return await contact.save();
  } catch (error: any) {
    throw new Error(`Error creating contact: ${error.message}`);
  }
};

// Create multiple Contact documents (e.g., for user and mentor)
export const createContactsForCollaboration = async (
  userId: string,
  mentorUserId: string,
  collaborationId: string
): Promise<IContact[]> => {
  try {
    const contacts = await Contact.insertMany([
      {
        userId: toObjectId(userId),
        targetUserId: toObjectId(mentorUserId),
        collaborationId: toObjectId(collaborationId),
        type: "user-mentor",
      },
      {
        userId: toObjectId(mentorUserId),
        targetUserId: toObjectId(userId),
        collaborationId: toObjectId(collaborationId),
        type: "user-mentor",
      },
    ]);
    return contacts as IContact[];
  } catch (error: any) {
    throw new Error(`Error creating contacts for collaboration: ${error.message}`);
  }
};