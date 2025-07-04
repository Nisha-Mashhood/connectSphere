import ChatMessage from "../models/chat.model.js";
import mongoose from "mongoose";
const toObjectId = (id) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid ID: must be a 24 character hex string");
    }
    return id ? new mongoose.Types.ObjectId(id) : undefined;
};
export const saveChatMessage = async (messageData) => {
    try {
        const message = new ChatMessage({
            ...messageData,
            senderId: messageData.senderId,
            collaborationId: messageData.collaborationId,
            userConnectionId: messageData.userConnectionId,
            groupId: messageData.groupId,
        });
        return await message.save();
    }
    catch (error) {
        throw new Error(`Error saving chat message: ${error.message}`);
    }
};
export const findChatMessageById = async (messageId) => {
    try {
        return await ChatMessage.findById(toObjectId(messageId)).exec();
    }
    catch (error) {
        throw new Error(`Error finding chat message by ID: ${error.message}`);
    }
};
export const findChatMessagesByCollaborationId = async (collaborationId, page, limit) => {
    try {
        return await ChatMessage.find({ collaborationId: toObjectId(collaborationId) })
            .sort({ timestamp: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .exec();
    }
    catch (error) {
        throw new Error(`Error finding chat messages by collaboration ID: ${error.message}`);
    }
};
export const findChatMessagesByUserConnectionId = async (userConnectionId, page, limit) => {
    try {
        return await ChatMessage.find({ userConnectionId: toObjectId(userConnectionId) })
            .sort({ timestamp: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .exec();
    }
    catch (error) {
        throw new Error(`Error finding chat messages by user connection ID: ${error.message}`);
    }
};
export const findChatMessagesByGroupId = async (groupId, page, limit) => {
    try {
        return await ChatMessage.find({ groupId: toObjectId(groupId) })
            .sort({ timestamp: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .exec();
    }
    catch (error) {
        throw new Error(`Error finding chat messages by group ID: ${error.message}`);
    }
};
export const countMessagesByCollaborationId = async (collaborationId) => {
    return await ChatMessage.countDocuments({ collaborationId: toObjectId(collaborationId) });
};
export const countMessagesByUserConnectionId = async (userConnectionId) => {
    return await ChatMessage.countDocuments({ userConnectionId: toObjectId(userConnectionId) });
};
export const countMessagesByGroupId = async (groupId) => {
    return await ChatMessage.countDocuments({ groupId: toObjectId(groupId) });
};
export const countUnreadMessagesByGroupId = async (groupId, userId) => {
    console.log(`Counting unread messages for groupId: ${groupId}, userId: ${userId}`);
    if (!mongoose.Types.ObjectId.isValid(groupId) || !mongoose.Types.ObjectId.isValid(userId)) {
        console.error(`Invalid groupId: ${groupId} or userId: ${userId}`);
        return 0;
    }
    const count = await ChatMessage.countDocuments({
        groupId: toObjectId(groupId),
        isRead: false,
        senderId: { $ne: toObjectId(userId) },
    });
    console.log(`Unread count for groupId ${groupId}: ${count}`);
    return count;
};
export const countUnreadMessagesByCollaborationId = async (collaborationId, userId) => {
    console.log(`Counting unread messages for collaborationId: ${collaborationId}, userId: ${userId}`);
    if (!mongoose.Types.ObjectId.isValid(collaborationId) || !mongoose.Types.ObjectId.isValid(userId)) {
        console.error(`Invalid collaborationId: ${collaborationId} or userId: ${userId}`);
        return 0;
    }
    const count = await ChatMessage.countDocuments({
        collaborationId: toObjectId(collaborationId),
        isRead: false,
        senderId: { $ne: toObjectId(userId) },
    });
    console.log(`Unread count for collaborationId ${collaborationId}: ${count}`);
    return count;
};
export const countUnreadMessagesByUserConnectionId = async (userConnectionId, userId) => {
    console.log(`Counting unread messages for userConnectionId: ${userConnectionId}, userId: ${userId}`);
    if (!mongoose.Types.ObjectId.isValid(userConnectionId) || !mongoose.Types.ObjectId.isValid(userId)) {
        console.error(`Invalid userConnectionId: ${userConnectionId} or userId: ${userId}`);
        return 0;
    }
    const count = await ChatMessage.countDocuments({
        userConnectionId: toObjectId(userConnectionId),
        isRead: false,
        senderId: { $ne: toObjectId(userId) },
    });
    console.log(`Unread count for userConnectionId ${userConnectionId}: ${count}`);
    return count;
};
export const markMessagesAsRead = async (chatKey, userId, type) => {
    try {
        const filter = { isRead: false, senderId: { $ne: toObjectId(userId) } };
        if (type === "group") {
            filter.groupId = toObjectId(chatKey.replace("group_", ""));
        }
        else if (type === "user-mentor") {
            filter.collaborationId = toObjectId(chatKey.replace("user-mentor_", ""));
        }
        else {
            filter.userConnectionId = toObjectId(chatKey.replace("user-user_", ""));
        }
        const unreadMessages = await ChatMessage.find(filter).select("_id");
        const messageIds = unreadMessages.map((msg) => (msg._id).toString());
        if (messageIds.length > 0) {
            await ChatMessage.updateMany({ _id: { $in: messageIds } }, { $set: { isRead: true, status: "read" } });
        }
        console.log("Marked messages as read:", { chatKey, userId, messageIds });
        return messageIds;
    }
    catch (error) {
        console.error("Error in markMessagesAsRead:", error.message);
        return [];
    }
};
//# sourceMappingURL=chat.repository.js.map