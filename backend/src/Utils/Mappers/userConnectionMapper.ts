import { IUserConnection } from '../../Interfaces/Models/IUserConnection';
import { IUserConnectionDTO } from '../../Interfaces/DTOs/IUserConnectionDTO';
import { toUserDTO } from './UserMapper';
import { IUser } from '../../Interfaces/Models/IUser';
import logger from '../../Core/Utils/Logger';
import { Types } from 'mongoose';
import { IUserDTO } from '../../Interfaces/DTOs/IUserDTO';

export function toUserConnectionDTO(connection: IUserConnection | null): IUserConnectionDTO | null {
  if (!connection) {
    logger.warn('Attempted to map null user connection to DTO');
    return null;
  }

  //requester (populated IUser or just an ID)
  let requesterId: string;
  let requester: IUserDTO | undefined;

  if (connection.requester) {
    if (typeof connection.requester === 'string') {
      requesterId = connection.requester;
    } else if (connection.requester instanceof Types.ObjectId) {
      requesterId = connection.requester.toString();
    } else {
      // Assume it's an IUser object (populated)
      requesterId = (connection.requester as IUser)._id.toString();
      const requesterDTO = toUserDTO(connection.requester as IUser);
      requester = requesterDTO ?? undefined;
    }
  } else {
    logger.warn(`User connection ${connection._id} has no requester`);
    requesterId = '';
  }

  //recipient (populated IUser or just an ID)
  let recipientId: string;
  let recipient: IUserDTO | undefined;

  if (connection.recipient) {
    if (typeof connection.recipient === 'string') {
      recipientId = connection.recipient;
    } else if (connection.recipient instanceof Types.ObjectId) {
      recipientId = connection.recipient.toString();
    } else {
      //IUser object (populated)
      recipientId = (connection.recipient as IUser)._id.toString();
      const recipientDTO = toUserDTO(connection.recipient as IUser);
      recipient = recipientDTO ?? undefined;
    }
  } else {
    logger.warn(`User connection ${connection._id} has no recipient`);
    recipientId = '';
  }

  return {
    id: connection._id.toString(),
    connectionId: connection.connectionId,
    requesterId,
    requester,
    recipientId,
    recipient,
    requestStatus: connection.requestStatus,
    connectionStatus: connection.connectionStatus,
    requestSentAt: connection.requestSentAt,
    requestAcceptedAt: connection.requestAcceptedAt,
    disconnectedAt: connection.disconnectedAt,
    disconnectionReason: connection.disconnectionReason,
    createdAt: connection.createdAt,
    updatedAt: connection.updatedAt,
  };
}

export function toUserConnectionDTOs(connections: IUserConnection[]): IUserConnectionDTO[] {
  return connections
    .map(toUserConnectionDTO)
    .filter((dto): dto is IUserConnectionDTO => dto !== null);
}