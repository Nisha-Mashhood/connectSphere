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

// Find a contact by its ID
export const findContactById = async (contactId: string): Promise<IContact | null> => {
  try {
    return await Contact.findById(toObjectId(contactId)).exec();
  } catch (error: any) {
    throw new Error(`Error finding contact by ID: ${error.message}`);
  }
};

// Find a contact by userId and targetUserId (for user-user or user-mentor chats)
export const findContactByUsers = async (userId: string, targetUserId: string): Promise<IContact | null> => {
  try {
    return await Contact.findOne({
      $or: [
        { userId: toObjectId(userId), targetUserId: toObjectId(targetUserId) },
        { userId: toObjectId(targetUserId), targetUserId: toObjectId(userId) }, // Bidirectional check
      ],
      type: { $in: ["user-user", "user-mentor"] }, // Ensure type matches
    }).exec();
  } catch (error: any) {
    throw new Error(`Error finding contact by user IDs: ${error.message}`);
  }
};

export interface PopulatedContact {
  _id: string | mongoose.Types.ObjectId;
  contactId: string;
  userId: { _id: string; name?: string; profilePic?: string };
  targetUserId?: { _id: string; name?: string; profilePic?: string };
  collaborationId?: {
    _id: string;
    mentorId: { userId: { _id: string; name?: string; profilePic?: string } };
    userId: { _id: string; name?: string; profilePic?: string };
  };
  userConnectionId?: {
    _id: string;
    requester: { _id: string; name?: string; profilePic?: string };
    recipient: { _id: string; name?: string; profilePic?: string };
  };
  groupId?: { _id: string; name?: string; profilePic?: string };
  type: "user-mentor" | "user-user" | "group";
  createdAt: Date;
  updatedAt: Date;
}


export const findContactsByUserId = async (userId: string): Promise<PopulatedContact[]> => {
  try {
    return await Contact.find({
      $or: [
        { userId: toObjectId(userId) },
        { targetUserId: toObjectId(userId) },
      ],
    })
      .populate({
        path: "userId",
        select: "name profilePic userId",
        model: "User",
      })
      .populate({
        path: "targetUserId",
        select: "name profilePic userId",
        model: "User",
      })
      .populate({
        path: "collaborationId",
        select: "mentorId userId",
        model: "Collaboration",
        populate: [
          { path: "mentorId", select: "userId", populate: { path: "userId", select: "name profilePic" } },
          { path: "userId", select: "name profilePic" },
        ],
      })
      .populate({
        path: "userConnectionId",
        select: "requester recipient",
        model: "UserConnection",
        populate: [
          { path: "requester", select: "name profilePic" },
          { path: "recipient", select: "name profilePic" },
        ],
      })
      .populate({
        path: "groupId",
        select: "name profilePic groupId",
        model: "Group",
      })
      .lean()
      .exec() as unknown as PopulatedContact[]; 
  } catch (error: any) {
    throw new Error(`Error finding contacts by user ID: ${error.message}`);
  }
};