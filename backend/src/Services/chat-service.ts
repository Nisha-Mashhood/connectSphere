import { inject, injectable } from "inversify";
import { Types } from "mongoose";
import { IChatMessage } from "../Interfaces/Models/i-chat-message";
import { IChatRepository } from "../Interfaces/Repository/i-chat-repositry";
import { IContactRepository } from "../Interfaces/Repository/i-contact-repositry";
import { IGroupRepository } from "../Interfaces/Repository/i-group-repositry";
import logger from "../core/utils/logger";
import { IContact } from "../Interfaces/Models/i-contact";
import { StatusCodes } from "../enums/status-code-enums";
import { ServiceError } from "../core/utils/error-handler";
import { IChatService } from "../Interfaces/Services/i-chat-service";
import { uploadMedia } from "../core/utils/cloudinary";
import { IChatMessageDTO } from "../Interfaces/DTOs/i-chat-message-dto";
import { toChatMessageDTOs } from "../Utils/mappers/chat-message-mapper";
import { LastMessageSummary } from "../Utils/types/contact-types";

@injectable()
export class ChatService implements IChatService {
  private _chatRepository: IChatRepository;
  private _contactRepository: IContactRepository;
  private _groupRepository: IGroupRepository;
  
  constructor(
    @inject('IChatRepository') chatRepository : IChatRepository,
    @inject('IContactRepository') contactRepository : IContactRepository,
    @inject('IGroupRepository') groupRepository : IGroupRepository
  ) {
    this._chatRepository = chatRepository;
    this._contactRepository = contactRepository;
    this._groupRepository = groupRepository;
  }

  getChatMessages = async (
    contactId?: string,
    groupId?: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{ messages: IChatMessageDTO[]; total: number }> => {
    try {
      logger.debug(
        `Fetching chat messages for contact: ${contactId}, group: ${groupId}, page: ${page}, limit: ${limit}`
      );
      if (!contactId && !groupId) {
        throw new ServiceError(
          "Contact ID or Group ID is required to fetch chat messages",
          StatusCodes.BAD_REQUEST
        );
      }
      if (contactId && groupId) {
        throw new ServiceError(
          "Provide only one of Contact ID or Group ID, not both",
          StatusCodes.BAD_REQUEST
        );
      }

      let messages: IChatMessage[] = [];
      let total = 0;

      if (groupId) {
        if (!Types.ObjectId.isValid(groupId)) {
          throw new ServiceError(
            "Invalid group ID: must be a 24 character hex string",
            StatusCodes.BAD_REQUEST
          );
        }
        const group = await this._groupRepository.getGroupById(groupId);
        if (!group) {
          throw new ServiceError("Invalid group ID", StatusCodes.NOT_FOUND);
        }
        messages = await this._chatRepository.findChatMessagesByGroupId(
          groupId,
          page,
          limit
        );
        total = await this._chatRepository.countMessagesByGroupId(groupId);
      } else if (contactId) {
        if (!Types.ObjectId.isValid(contactId)) {
          throw new ServiceError(
            "Invalid contact ID: must be a 24 character hex string",
            StatusCodes.BAD_REQUEST
          );
        }
        const contact: IContact | null = await this._contactRepository.findContactById(
          contactId
        );
        if (!contact) {
          throw new ServiceError("Invalid contact ID", StatusCodes.NOT_FOUND);
        }

        if (contact.type === "user-mentor" && contact.collaborationId) {
          messages = await this._chatRepository.findChatMessagesByCollaborationId(
            contact.collaborationId.toString(),
            page,
            limit
          );
          total = await this._chatRepository.countMessagesByCollaborationId(
            contact.collaborationId.toString()
          );
        } else if (contact.type === "user-user" && contact.userConnectionId) {
          messages = await this._chatRepository.findChatMessagesByUserConnectionId(
            contact.userConnectionId.toString(),
            page,
            limit
          );
          total = await this._chatRepository.countMessagesByUserConnectionId(
            contact.userConnectionId.toString()
          );
        } else {
          throw new ServiceError(
            "No valid connection ID found for contact",
            StatusCodes.BAD_REQUEST
          );
        }
      }

      const messagesDTO = toChatMessageDTOs(messages);
      return { messages: messagesDTO.reverse(), total };
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error fetching chat messages: ${err.message}`);
      throw error instanceof ServiceError
        ? error
        : new ServiceError(
            "Failed to fetch chat messages",
            StatusCodes.INTERNAL_SERVER_ERROR,
            err
          );
    }
  };

  getUnreadMessageCounts = async (
    userId: string
  ): Promise<{ [key: string]: number }> => {
    try {
      logger.debug(`Fetching unread message counts for user: ${userId}`);
      if (!userId) {
        throw new ServiceError("User ID is required", StatusCodes.BAD_REQUEST);
      }
      if (!Types.ObjectId.isValid(userId)) {
        throw new ServiceError(
          "Invalid user ID: must be a 24 character hex string",
          StatusCodes.BAD_REQUEST
        );
      }

      const contacts = await this._contactRepository.findContactsByUserId(userId);
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
            count = await this._chatRepository.countUnreadMessagesByGroupId(
              groupIdStr,
              userId
            );
            unreadCounts[`group_${groupIdStr}`] = count;
          } else if (
            contact.type === "user-mentor" &&
            contact.collaborationId
          ) {
            const collabIdStr = contact.collaborationId._id?.toString();
            if (!collabIdStr) continue;
            count = await this._chatRepository.countUnreadMessagesByCollaborationId(
              collabIdStr,
              userId
            );
            unreadCounts[`user-mentor_${collabIdStr}`] = count;
          } else if (contact.type === "user-user" && contact.userConnectionId) {
            const userConnIdStr = contact.userConnectionId._id?.toString();
            if (!userConnIdStr) continue;
            count = await this._chatRepository.countUnreadMessagesByUserConnectionId(
              userConnIdStr,
              userId
            );
            unreadCounts[`user-user_${userConnIdStr}`] = count;
          }
        } catch (error: unknown) {
          const err = error instanceof Error ? error : new Error(String(error));
          logger.warn(
            `Skipping unread count for contact ${contact._id}: ${err.message}`
          );
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
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(
        `Error fetching unread message counts for user ${userId}: ${err.message}`
      );
      throw error instanceof ServiceError
        ? error
        : new ServiceError(
            "Failed to fetch unread message counts",
            StatusCodes.INTERNAL_SERVER_ERROR,
            err
          );
    }
  };

  uploadAndSaveMessage = async (data: {
    senderId: string;
    targetId: string;
    type: 'user-mentor' | 'user-user' | 'group';
    collaborationId?: string;
    userConnectionId?: string;
    groupId?: string;
    file: {
      path: string;
      size?: number;
      originalname?: string;
      mimetype?: string;
    };
  }): Promise<{ url: string; thumbnailUrl?: string; messageId: string }> => {
    try {
      logger.debug(`Uploading and saving message: senderId=${data.senderId}, targetId=${data.targetId}, type=${data.type}`);

      // Validate message type and associated IDs
      if (data.type === 'user-mentor' && !data.collaborationId) {
        throw new ServiceError('Collaboration ID is required for user-mentor messages', StatusCodes.BAD_REQUEST);
      }
      if (data.type === 'user-user' && !data.userConnectionId) {
        throw new ServiceError('User connection ID is required for user-user messages', StatusCodes.BAD_REQUEST);
      }
      if (data.type === 'group' && !data.groupId) {
        throw new ServiceError('Group ID is required for group messages', StatusCodes.BAD_REQUEST);
      }

      // Ensure only the relevant ID is included
      if (data.type !== 'user-mentor' && data.collaborationId) {
        throw new ServiceError('Collaboration ID is only valid for user-mentor messages', StatusCodes.BAD_REQUEST);
      }
      if (data.type !== 'user-user' && data.userConnectionId) {
        throw new ServiceError('User connection ID is only valid for user-user messages', StatusCodes.BAD_REQUEST);
      }
      if (data.type !== 'group' && data.groupId) {
        throw new ServiceError('Group ID is only valid for group messages', StatusCodes.BAD_REQUEST);
      }

      const folder = data.type === 'group' ? 'group_chat_media' : 'chat_media';
      const contentType = data.file.mimetype?.startsWith('image/')
        ? 'image'
        : data.file.mimetype?.startsWith('video/')
        ? 'video'
        : 'file';
      const { url, thumbnailUrl } = await uploadMedia(data.file.path, folder, data.file.size, contentType);

      const message = await this._chatRepository.saveChatMessage({
        senderId: data.senderId,
        content: url,
        thumbnailUrl,
        contentType,
        collaborationId: data.collaborationId,
        userConnectionId: data.userConnectionId,
        groupId: data.groupId,
        fileMetadata: {
          fileName: data.file.originalname,
          fileSize: data.file.size,
          mimeType: data.file.mimetype,
        },
        timestamp: new Date(),
      });

      logger.info(`Saved message: ${message._id}`);
      return { url, thumbnailUrl, messageId: message._id.toString() };
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error uploading and saving message: ${err.message}`);
      throw error instanceof ServiceError
        ? error
        : new ServiceError(
            "Failed to upload and save message",
            StatusCodes.INTERNAL_SERVER_ERROR,
            err
          );
    }
  };

  getLastMessageSummaries = async (
  userId: string
): Promise<{ [chatKey: string]: LastMessageSummary }> => {
  try {
    logger.debug(`Fetching last message summaries for user: ${userId}`);
    if (!userId) {
      throw new ServiceError("User ID is required", StatusCodes.BAD_REQUEST);
    }
    if (!Types.ObjectId.isValid(userId)) {
      throw new ServiceError(
        "Invalid user ID: must be a 24 character hex string",
        StatusCodes.BAD_REQUEST
      );
    }

    const contacts = await this._contactRepository.findContactsByUserId(userId);
    const summaries: { [chatKey: string]: LastMessageSummary } = {};

    for (const contact of contacts) {
      try {
        if (contact.type === "group" && contact.groupId?._id) {
          const groupId = contact.groupId._id.toString();
          const msg = await this._chatRepository.findLatestMessageByGroupId(
            groupId
          );
          if (msg) {
            summaries[`group_${groupId}`] = {
              content: msg.content,
              senderId: msg.senderId.toString(),
              timestamp: msg.timestamp,
              contentType: msg.contentType as any,
            };
          }
        } else if (
          contact.type === "user-mentor" &&
          contact.collaborationId?._id
        ) {
          const collabId = contact.collaborationId._id.toString();
          const msg =
            await this._chatRepository.findLatestMessageByCollaborationId(
              collabId
            );
          if (msg) {
            summaries[`user-mentor_${collabId}`] = {
              content: msg.content,
              senderId: msg.senderId.toString(),
              timestamp: msg.timestamp,
              contentType: msg.contentType as any,
            };
          }
        } else if (
          contact.type === "user-user" &&
          contact.userConnectionId?._id
        ) {
          const connId = contact.userConnectionId._id.toString();
          const msg =
            await this._chatRepository.findLatestMessageByUserConnectionId(
              connId
            );
          if (msg) {
            summaries[`user-user_${connId}`] = {
              content: msg.content,
              senderId: msg.senderId.toString(),
              timestamp: msg.timestamp,
              contentType: msg.contentType as any,
            };
          }
        }
      } catch (err: any) {
        logger.warn(
          `Skipping last message summary for contact ${contact._id}: ${err.message}`
        );
      }
    }

    return summaries;
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error(
      `Error fetching last message summaries for user ${userId}: ${err.message}`
    );
    throw error instanceof ServiceError
      ? error
      : new ServiceError(
          "Failed to fetch last message summaries",
          StatusCodes.INTERNAL_SERVER_ERROR,
          err
        );
  }
};
}
