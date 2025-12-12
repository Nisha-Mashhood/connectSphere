import { injectable } from "inversify";
import { Types, Model } from "mongoose";
import { BaseRepository } from "../core/repositries/base-repositry";
import { RepositoryError } from "../core/utils/error-handler";
import logger from "../core/utils/logger";
import ChatMessage from "../Models/chat-model";
import { IChatMessage } from "../Interfaces/Models/i-chat-message";
import { IChatRepository } from "../Interfaces/Repository/i-chat-repositry";
import { StatusCodes } from "../enums/status-code-enums";
import { ERROR_MESSAGES } from "../constants/error-messages";

@injectable()
export class ChatRepository extends BaseRepository<IChatMessage> implements IChatRepository{
  constructor() {
    super(ChatMessage as Model<IChatMessage>);
  }

  private toObjectId(id?: string | Types.ObjectId): Types.ObjectId {
    if (!id) {
      logger.warn("Missing ID when converting to ObjectId");
      throw new RepositoryError("Invalid ID: ID is required", StatusCodes.BAD_REQUEST);
    }

    const idStr = id instanceof Types.ObjectId ? id.toString() : id;
    if (!Types.ObjectId.isValid(idStr)) {
      logger.warn(`Invalid ObjectId format: ${idStr}`);
      throw new RepositoryError(
        "Invalid ID: must be a 24 character hex string"
      );
    }

    return new Types.ObjectId(idStr);
  }

  public saveChatMessage = async (data: Partial<IChatMessage>): Promise<IChatMessage> => {
    try {
      logger.debug(`Saving chat message for sender: ${data.senderId}`);
      const message = await this.create({
        ...data,
        senderId: data.senderId ? this.toObjectId(data.senderId) : undefined,
        collaborationId: data.collaborationId ? this.toObjectId(data.collaborationId) : undefined,
        userConnectionId: data.userConnectionId ? this.toObjectId(data.userConnectionId) : undefined,
        groupId: data.groupId ? this.toObjectId(data.groupId) : undefined,
      });
      logger.info(`Chat message created: ${message._id}`);
      return message;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error saving chat message`, err);
      throw new RepositoryError(
        ERROR_MESSAGES.FAILED_TO_SAVE_CHAT_MESSAGE,
        StatusCodes.INTERNAL_SERVER_ERROR,
        err
      );
    }
  }

  public findChatMessageById = async (messageId: string): Promise<IChatMessage | null> => {
    try {
      logger.debug(`Finding chat message by ID: ${messageId}`);
      const message = await this.findById(messageId);
      logger.info(`Chat message ${message ? 'found' : 'not found'}: ${messageId}`);
      return message;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error finding chat message by ID ${messageId}: ${err}`);
      throw new RepositoryError(
        `${ERROR_MESSAGES.FAILED_TO_FIND_CHAT_MESSAGE_BY_ID} ${messageId}`,
        StatusCodes.INTERNAL_SERVER_ERROR,
        err
      );
    }
  }

  public findChatMessagesByCollaborationId = async (
    collaborationId: string,
    page: number,
    limit: number
  ): Promise<IChatMessage[]> => {
    try {
      logger.debug(`Finding messages for collaboration: ${collaborationId}`);
      const id = this.toObjectId(collaborationId);
      return await this.model
        .find({ collaborationId: id })
        .sort({ timestamp: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec();
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error finding messages by collaboration ID: ${err}`);
      throw new RepositoryError(
        `${ERROR_MESSAGES.FAILED_TO_FIND_CHAT_MESSAGES_BY_COLLABORATION_ID} ${collaborationId}`,
        StatusCodes.INTERNAL_SERVER_ERROR,
        err
      );
    }
  }

  public findChatMessagesByUserConnectionId = async (
    userConnectionId: string,
    page: number,
    limit: number
  ): Promise<IChatMessage[]> => {
    try {
      logger.debug(`Finding messages for user connection: ${userConnectionId}`);
      const id = this.toObjectId(userConnectionId);
      return await this.model
        .find({ userConnectionId: id })
        .sort({ timestamp: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec();
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error finding messages by user connection ID: ${err}`);
      throw new RepositoryError(
        `${ERROR_MESSAGES.FAILED_TO_FIND_CHAT_MESSAGES_BY_USER_CONNECTION_ID} ${userConnectionId}`,
        StatusCodes.INTERNAL_SERVER_ERROR,
        err
      );
    }
  }

  public findChatMessagesByGroupId = async (
    groupId: string,
    page: number,
    limit: number
  ): Promise<IChatMessage[]> => {
    try {
      logger.debug(`Finding messages for group: ${groupId}`);
      const id = this.toObjectId(groupId);
      return await this.model
        .find({ groupId: id })
        .sort({ timestamp: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec();
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error finding messages by group ID: ${err}`);
      throw new RepositoryError(
        `${ERROR_MESSAGES.FAILED_TO_FIND_CHAT_MESSAGES_BY_GROUP_ID} ${groupId}`,
        StatusCodes.INTERNAL_SERVER_ERROR,
        err
      );
    }
  }

  public countMessagesByCollaborationId = async (collaborationId: string): Promise<number> => {
    try {
      logger.debug(`Counting messages for collaboration: ${collaborationId}`);
      const id = this.toObjectId(collaborationId);
      return await this.model.countDocuments({ collaborationId: id });
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error counting messages by collaboration ID: ${err}`);
      throw new RepositoryError(
        `${ERROR_MESSAGES.FAILED_TO_COUNT_MESSAGES_BY_COLLABORATION_ID} ${collaborationId}`,
        StatusCodes.INTERNAL_SERVER_ERROR,
        err
      );
    }
  }

  public countMessagesByUserConnectionId = async (userConnectionId: string): Promise<number> => {
    try {
      logger.debug(`Counting messages for user connection: ${userConnectionId}`);
      const id = this.toObjectId(userConnectionId);
      return await this.model.countDocuments({ userConnectionId: id });
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error counting messages by user connection ID: ${err}`);
      throw new RepositoryError(
        `${ERROR_MESSAGES.FAILED_TO_COUNT_MESSAGES_BY_USER_CONNECTION_ID} ${userConnectionId}`,
        StatusCodes.INTERNAL_SERVER_ERROR,
        err
      );
    }
  }

  public countMessagesByGroupId = async (groupId: string): Promise<number> => {
    try {
      logger.debug(`Counting messages for group: ${groupId}`);
      const id = this.toObjectId(groupId);
      return await this.model.countDocuments({ groupId: id });
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error counting messages by group ID: ${err}`);
      throw new RepositoryError(
        `${ERROR_MESSAGES.FAILED_TO_COUNT_MESSAGES_BY_GROUP_ID} ${groupId}`,
        StatusCodes.INTERNAL_SERVER_ERROR,
        err
      );
    }
  }

  public countUnreadMessagesByGroupId = async (
    groupId: string,
    userId: string
  ): Promise<number> => {
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
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error counting unread messages by group ID: ${err}`);
      throw new RepositoryError(
        `${ERROR_MESSAGES.FAILED_TO_COUNT_UNREAD_MESSAGES_BY_GROUP_ID} ${groupId}`,
        StatusCodes.INTERNAL_SERVER_ERROR,
        err
      );
    }
  }

  public countUnreadMessagesByCollaborationId = async (
    collaborationId: string,
    userId: string
  ): Promise<number> => {
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
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error counting unread messages by collaboration ID: ${err}`);
      throw new RepositoryError(
        `${ERROR_MESSAGES.FAILED_TO_COUNT_UNREAD_MESSAGES_BY_COLLABORATION_ID} ${collaborationId}`,
        StatusCodes.INTERNAL_SERVER_ERROR,
        err
      );
    }
  }

  public countUnreadMessagesByUserConnectionId = async (
    userConnectionId: string,
    userId: string
  ): Promise<number> => {
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
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error counting unread messages by user connection ID: ${err}`);
      throw new RepositoryError(
        `${ERROR_MESSAGES.FAILED_TO_COUNT_UNREAD_MESSAGES_BY_USER_CONNECTION_ID} ${userConnectionId}`,
        StatusCodes.INTERNAL_SERVER_ERROR,
        err
      );
    }
  }

  public markMessagesAsRead = async (
    chatKey: string,
    userId: string,
    type: "group" | "user-mentor" | "user-user"
  ): Promise<string[]> => {
    try {
      logger.debug(`Marking messages as read: ${chatKey}, user: ${userId}, type: ${type}`);
      const filter: Record<string, any> = {
        isRead: false,
        senderId: { $ne: this.toObjectId(userId) },
      };
      if (type === "group") {
        filter.groupId = this.toObjectId(chatKey.replace("group_", ""));
      } else if (type === "user-mentor") {
        filter.collaborationId = this.toObjectId(chatKey.replace("user-mentor_", ""));
      } else {
        filter.userConnectionId = this.toObjectId(chatKey.replace("user-user_", ""));
      }
      const unreadMessages = await this.model.find(filter).select("_id").exec();
      const messageIds = unreadMessages.map((msg) => msg._id.toString());

      if (messageIds.length > 0) {
        await this.model.updateMany(
          { _id: { $in: messageIds.map((id) => this.toObjectId(id)) } },
          { $set: { isRead: true, status: "read" } }
        );
        logger.info(`Marked ${messageIds.length} messages as read for ${chatKey}`);
      }

      return messageIds;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error marking messages as read: ${err}`);
      throw new RepositoryError(
        ERROR_MESSAGES.FAILED_TO_MARK_MESSAGES_AS_READ,
        StatusCodes.INTERNAL_SERVER_ERROR,
        err
      );
    }
  }

  public async findLatestMessageByGroupId(groupId: string): Promise<IChatMessage | null> {
    try {
      logger.debug(`Finding latest message for groupId: ${groupId}`);
      const message = await this.model
        .findOne({ groupId: this.toObjectId(groupId) })
        .sort({ timestamp: -1 })
        .select('timestamp content senderId contentType')
        .lean()
        .exec();
      return message as IChatMessage | null;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error finding latest message by groupId ${groupId}: ${err}`);
      throw new RepositoryError(
        `${ERROR_MESSAGES.FAILED_TO_FIND_LATEST_MESSAGE} by groupId ${groupId}`,
        StatusCodes.INTERNAL_SERVER_ERROR,
        err
      );
    }
  }

  public async findLatestMessageByCollaborationId(collaborationId: string): Promise<IChatMessage | null> {
    try {
      logger.debug(`Finding latest message for collaborationId: ${collaborationId}`);
      const message = await this.model
        .findOne({ collaborationId: this.toObjectId(collaborationId) })
        .sort({ timestamp: -1 })
        .select('timestamp content senderId contentType')
        .lean()
        .exec();
      return message as IChatMessage | null;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error finding latest message by collaborationId ${collaborationId}: ${err}`);
      throw new RepositoryError(
        `${ERROR_MESSAGES.FAILED_TO_FIND_LATEST_MESSAGE} by collaborationId ${collaborationId}`,
        StatusCodes.INTERNAL_SERVER_ERROR,
        err
      );
    }
  }

  public async findLatestMessageByUserConnectionId(userConnectionId: string): Promise<IChatMessage | null> {
    try {
      logger.debug(`Finding latest message for userConnectionId: ${userConnectionId}`);
      const message = await this.model
        .findOne({ userConnectionId: this.toObjectId(userConnectionId) })
        .sort({ timestamp: -1 })
        .select('timestamp content senderId contentType')
        .lean()
        .exec();
      return message as IChatMessage | null;
    } catch(error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error finding latest message by userConnectionId ${userConnectionId}: ${err}`);
      throw new RepositoryError(
        `${ERROR_MESSAGES.FAILED_TO_FIND_LATEST_MESSAGE} by userConnectionId ${userConnectionId}`,
        StatusCodes.INTERNAL_SERVER_ERROR,
        err
      );
    }
  }
}
