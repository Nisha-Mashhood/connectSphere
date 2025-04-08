import ChatMessage from "../models/chat.model.js";
import mongoose from "mongoose";
const toObjectId = (id) => {
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
//# sourceMappingURL=chat.repository.js.map