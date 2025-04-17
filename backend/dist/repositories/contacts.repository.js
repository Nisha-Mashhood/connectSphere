import Contact from "../models/contacts.model.js";
import mongoose from "mongoose";
// Utility to convert string to ObjectId
const toObjectId = (id) => new mongoose.Types.ObjectId(id);
// Create a single Contact document
export const createContact = async (contactData) => {
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
    }
    catch (error) {
        throw new Error(`Error creating contact: ${error.message}`);
    }
};
// Find a contact by its ID
export const findContactById = async (contactId) => {
    try {
        return await Contact.findById(toObjectId(contactId)).exec();
    }
    catch (error) {
        throw new Error(`Error finding contact by ID: ${error.message}`);
    }
};
// Find a contact by userId and targetUserId (for user-user or user-mentor chats)
export const findContactByUsers = async (userId, targetUserId) => {
    try {
        return await Contact.findOne({
            $or: [
                { userId: toObjectId(userId), targetUserId: toObjectId(targetUserId) },
                { userId: toObjectId(targetUserId), targetUserId: toObjectId(userId) }, // Bidirectional check
            ],
            type: { $in: ["user-user", "user-mentor"] }, // Ensure type matches
        }).exec();
    }
    catch (error) {
        throw new Error(`Error finding contact by user IDs: ${error.message}`);
    }
};
export const findContactsByUserId = async (userId) => {
    try {
        return await Contact.find({
            $or: [
                { userId: toObjectId(userId) },
                { targetUserId: toObjectId(userId) },
            ],
        })
            .populate({
            path: "userId",
            select: "name profilePic userId jobTitle",
            model: "User",
        })
            .populate({
            path: "targetUserId",
            select: "name profilePic userId jobTitle",
            model: "User",
        })
            .populate({
            path: "collaborationId",
            select: "mentorId userId startDate endDate price selectedSlot",
            model: "Collaboration",
            populate: [
                { path: "mentorId", select: "userId", populate: { path: "userId", select: "name profilePic jobTitle" } },
                { path: "userId", select: "name profilePic jobTitle" },
            ],
        })
            .populate({
            path: "userConnectionId",
            select: "requester recipient requestAcceptedAt",
            model: "UserConnection",
            populate: [
                { path: "requester", select: "name profilePic jobTitle" },
                { path: "recipient", select: "name profilePic jobTitle" },
            ],
        })
            .populate({
            path: "groupId",
            select: "name profilePic startDate adminId members",
            model: "Group",
            populate: [
                { path: "adminId", select: "name profilePic" },
                { path: "members.userId", select: "name profilePic" },
            ],
        })
            .lean()
            .exec();
    }
    catch (error) {
        throw new Error(`Error finding contacts by user ID: ${error.message}`);
        throw new Error(`Error finding contacts by user ID: ${error.message}`);
    }
};
//# sourceMappingURL=contacts.repository.js.map