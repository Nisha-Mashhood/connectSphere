import { Types } from 'mongoose';
import { BaseRepository } from '../../../core/Repositries/BaseRepositry.js';
import { RepositoryError } from '../../../core/Utils/ErrorHandler.js';
import logger from '../../../core/Utils/Logger.js';
import ChatMessage from '../../../models/chat.model.js';
export class ChatRepository extends BaseRepository {
    constructor() {
        super(ChatMessage);
    }
    toObjectId(id) {
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
    saveChatMessage = async (messageData) => {
        try {
            logger.debug(`Saving chat message for sender: ${messageData.senderId}`);
            return await this.create({
                ...messageData,
                senderId: messageData.senderId ? this.toObjectId(messageData.senderId) : undefined,
                collaborationId: messageData.collaborationId ? this.toObjectId(messageData.collaborationId) : undefined,
                userConnectionId: messageData.userConnectionId ? this.toObjectId(messageData.userConnectionId) : undefined,
                groupId: messageData.groupId ? this.toObjectId(messageData.groupId) : undefined,
            });
        }
        catch (error) {
            logger.error(`Error saving chat message: ${error.message}`);
            throw new RepositoryError(`Error saving chat message: ${error.message}`);
        }
    };
    findChatMessageById = async (messageId) => {
        return await this.findById(messageId);
    };
    findChatMessagesByCollaborationId = async (collaborationId, page, limit) => {
        try {
            logger.debug(`Finding messages for collaboration: ${collaborationId}`);
            const id = this.toObjectId(collaborationId);
            return await this.model
                .find({ collaborationId: id })
                .sort({ timestamp: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .exec();
        }
        catch (error) {
            logger.error(`Error finding messages by collaboration ID: ${error.message}`);
            throw new RepositoryError(`Error finding chat messages by collaboration ID: ${error.message}`);
        }
    };
    findChatMessagesByUserConnectionId = async (userConnectionId, page, limit) => {
        try {
            logger.debug(`Finding messages for user connection: ${userConnectionId}`);
            const id = this.toObjectId(userConnectionId);
            return await this.model
                .find({ userConnectionId: id })
                .sort({ timestamp: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .exec();
        }
        catch (error) {
            logger.error(`Error finding messages by user connection ID: ${error.message}`);
            throw new RepositoryError(`Error finding chat messages by user connection ID: ${error.message}`);
        }
    };
    findChatMessagesByGroupId = async (groupId, page, limit) => {
        try {
            logger.debug(`Finding messages for group: ${groupId}`);
            const id = this.toObjectId(groupId);
            return await this.model
                .find({ groupId: id })
                .sort({ timestamp: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .exec();
        }
        catch (error) {
            logger.error(`Error finding messages by group ID: ${error.message}`);
            throw new RepositoryError(`Error finding chat messages by group ID: ${error.message}`);
        }
    };
    countMessagesByCollaborationId = async (collaborationId) => {
        try {
            logger.debug(`Counting messages for collaboration: ${collaborationId}`);
            const id = this.toObjectId(collaborationId);
            return await this.model.countDocuments({ collaborationId: id });
        }
        catch (error) {
            logger.error(`Error counting messages by collaboration ID: ${error.message}`);
            throw new RepositoryError(`Error counting messages by collaboration ID: ${error.message}`);
        }
    };
    countMessagesByUserConnectionId = async (userConnectionId) => {
        try {
            logger.debug(`Counting messages for user connection: ${userConnectionId}`);
            const id = this.toObjectId(userConnectionId);
            return await this.model.countDocuments({ userConnectionId: id });
        }
        catch (error) {
            logger.error(`Error counting messages by user connection ID: ${error.message}`);
            throw new RepositoryError(`Error counting messages by user connection ID: ${error.message}`);
        }
    };
    countMessagesByGroupId = async (groupId) => {
        try {
            logger.debug(`Counting messages for group: ${groupId}`);
            const id = this.toObjectId(groupId);
            return await this.model.countDocuments({ groupId: id });
        }
        catch (error) {
            logger.error(`Error counting messages by group ID: ${error.message}`);
            throw new RepositoryError(`Error counting messages by group ID: ${error.message}`);
        }
    };
    countUnreadMessagesByGroupId = async (groupId, userId) => {
        try {
            logger.debug(`Counting unread messages for group: ${groupId}, user: ${userId}`);
            const gId = this.toObjectId(groupId);
            const uId = this.toObjectId(userId);
            const count = await this.model.countDocuments({
                groupId: gId,
                isRead: false,
                senderId: { $ne: uId },
            });
            logger.debug(`Unread count for group ${groupId}: ${count}`);
            return count;
        }
        catch (error) {
            logger.error(`Error counting unread messages by group ID: ${error.message}`);
            throw new RepositoryError(`Error counting unread messages by group ID: ${error.message}`);
        }
    };
    countUnreadMessagesByCollaborationId = async (collaborationId, userId) => {
        try {
            logger.debug(`Counting unread messages for collaboration: ${collaborationId}, user: ${userId}`);
            const cId = this.toObjectId(collaborationId);
            const uId = this.toObjectId(userId);
            const count = await this.model.countDocuments({
                collaborationId: cId,
                isRead: false,
                senderId: { $ne: uId },
            });
            logger.debug(`Unread count for collaboration ${collaborationId}: ${count}`);
            return count;
        }
        catch (error) {
            logger.error(`Error counting unread messages by collaboration ID: ${error.message}`);
            throw new RepositoryError(`Error counting unread messages by collaboration ID: ${error.message}`);
        }
    };
    countUnreadMessagesByUserConnectionId = async (userConnectionId, userId) => {
        try {
            logger.debug(`Counting unread messages for user connection: ${userConnectionId}, user: ${userId}`);
            const ucId = this.toObjectId(userConnectionId);
            const uId = this.toObjectId(userId);
            const count = await this.model.countDocuments({
                userConnectionId: ucId,
                isRead: false,
                senderId: { $ne: uId },
            });
            logger.debug(`Unread count for user connection ${userConnectionId}: ${count}`);
            return count;
        }
        catch (error) {
            logger.error(`Error counting unread messages by user connection ID: ${error.message}`);
            throw new RepositoryError(`Error counting unread messages by user connection ID: ${error.message}`);
        }
    };
    markMessagesAsRead = async (chatKey, userId, type) => {
        try {
            logger.debug(`Marking messages as read: ${chatKey}, user: ${userId}, type: ${type}`);
            const filter = { isRead: false, senderId: { $ne: this.toObjectId(userId) } };
            if (type === 'group') {
                filter.groupId = this.toObjectId(chatKey.replace('group_', ''));
            }
            else if (type === 'user-mentor') {
                filter.collaborationId = this.toObjectId(chatKey.replace('user-mentor_', ''));
            }
            else {
                filter.userConnectionId = this.toObjectId(chatKey.replace('user-user_', ''));
            }
            const unreadMessages = await this.model.find(filter).select('_id').exec();
            const messageIds = unreadMessages.map((msg) => msg._id.toString());
            if (messageIds.length > 0) {
                await this.model.updateMany({ _id: { $in: messageIds.map((id) => this.toObjectId(id)) } }, { $set: { isRead: true, status: 'read' } });
                logger.info(`Marked ${messageIds.length} messages as read for ${chatKey}`);
            }
            return messageIds;
        }
        catch (error) {
            logger.error(`Error marking messages as read: ${error.message}`);
            throw new RepositoryError(`Error marking messages as read: ${error.message}`);
        }
    };
}
//# sourceMappingURL=ChatRepositry.js.map