import { IChatMessage } from '../../Interfaces/Models/i-chat-message';
import { IChatMessageDTO } from '../../Interfaces/DTOs/i-chat-message-dto';
import { toUserDTO } from './user-mapper';
import { toCollaborationDTO } from './collaboration-mapper';
import { toUserConnectionDTO } from './user-connection-mapper';
import { toGroupDTO } from './group-mapper';
import { IUser } from '../../Interfaces/Models/i-user';
import { ICollaboration } from '../../Interfaces/Models/i-collaboration';
import { IUserConnection } from '../../Interfaces/Models/i-user-connection';
import { IGroup } from '../../Interfaces/Models/i-group';
import logger from '../../core/utils/logger';
import { Types } from 'mongoose';
import { IUserDTO } from '../../Interfaces/DTOs/i-user-dto';
import { ICollaborationDTO } from '../../Interfaces/DTOs/i-collaboration-dto';
import { IUserConnectionDTO } from '../../Interfaces/DTOs/i-user-connection-dto';
import { IGroupDTO } from '../../Interfaces/DTOs/i-group-dto';

export function toChatMessageDTO(chatMessage: IChatMessage | null): IChatMessageDTO | null {
  if (!chatMessage) {
    logger.warn('Attempted to map null chat message to DTO');
    return null;
  }

  //senderId (populated IUser or just an ID)
  let senderId: string;
  let sender: IUserDTO | undefined;

  if (chatMessage.senderId) {
    if (typeof chatMessage.senderId === 'string') {
      senderId = chatMessage.senderId;
    } else if (chatMessage.senderId instanceof Types.ObjectId) {
      senderId = chatMessage.senderId.toString();
    } else {
      //IUser object (populated)
      senderId = (chatMessage.senderId as IUser)._id.toString();
      const userDTO = toUserDTO(chatMessage.senderId as IUser);
      sender = userDTO ?? undefined;
    }
  } else {
    logger.warn(`Chat message ${chatMessage._id} has no senderId`);
    senderId = '';
  }

  //collaborationId (populated ICollaboration or just an ID)
  let collaborationId: string | undefined;
  let collaboration: ICollaborationDTO | undefined;

  if (chatMessage.collaborationId) {
    if (typeof chatMessage.collaborationId === 'string') {
      collaborationId = chatMessage.collaborationId;
    } else if (chatMessage.collaborationId instanceof Types.ObjectId) {
      collaborationId = chatMessage.collaborationId.toString();
    } else {
      //ICollaboration object (populated)
      collaborationId = (chatMessage.collaborationId as ICollaboration)._id.toString();
      const collaborationDTO = toCollaborationDTO(chatMessage.collaborationId as ICollaboration);
      collaboration = collaborationDTO ?? undefined;
    }
  }

  //userConnectionId (populated IUserConnection or just an ID)
  let userConnectionId: string | undefined;
  let userConnection: IUserConnectionDTO | undefined;

  if (chatMessage.userConnectionId) {
    if (typeof chatMessage.userConnectionId === 'string') {
      userConnectionId = chatMessage.userConnectionId;
    } else if (chatMessage.userConnectionId instanceof Types.ObjectId) {
      userConnectionId = chatMessage.userConnectionId.toString();
    } else {
      //IUserConnection object (populated)
      userConnectionId = (chatMessage.userConnectionId as IUserConnection)._id.toString();
      const userConnectionDTO = toUserConnectionDTO(chatMessage.userConnectionId as IUserConnection);
      userConnection = userConnectionDTO ?? undefined;
    }
  }

  //groupId (populated IGroup or just an ID)
  let groupId: string | undefined;
  let group: IGroupDTO | undefined;

  if (chatMessage.groupId) {
    if (typeof chatMessage.groupId === 'string') {
      groupId = chatMessage.groupId;
    } else if (chatMessage.groupId instanceof Types.ObjectId) {
      groupId = chatMessage.groupId.toString();
    } else {
      //IGroup object (populated)
      groupId = (chatMessage.groupId as IGroup)._id.toString();
      const groupDTO = toGroupDTO(chatMessage.groupId as IGroup);
      group = groupDTO ?? undefined;
    }
  }

  return {
    id: chatMessage._id.toString(),
    ChatId: chatMessage.ChatId,
    senderId,
    sender,
    content: chatMessage.content,
    thumbnailUrl: chatMessage.thumbnailUrl,
    collaborationId,
    collaboration,
    userConnectionId,
    userConnection,
    groupId,
    group,
    contentType: chatMessage.contentType,
    fileMetadata: chatMessage.fileMetadata,
    isRead: chatMessage.isRead,
    status: chatMessage.status,
    timestamp: chatMessage.timestamp,
  };
}

export function toChatMessageDTOs(chatMessages: IChatMessage[]): IChatMessageDTO[] {
  return chatMessages
    .map(toChatMessageDTO)
    .filter((dto): dto is IChatMessageDTO => dto !== null);
}