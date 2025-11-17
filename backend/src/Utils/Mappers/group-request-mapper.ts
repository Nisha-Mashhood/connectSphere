import { IGroupRequest } from '../../Interfaces/Models/i-group-request';
import { IGroupRequestDTO } from '../../Interfaces/DTOs/i-group-request-dto';
import { toGroupDTO } from './group-mapper';
import { toUserDTO } from './user-mapper';
import { IGroup } from '../../Interfaces/Models/i-group';
import { IUser } from '../../Interfaces/Models/i-user';
import logger from '../../core/utils/logger';
import { Types } from 'mongoose';
import { IUserDTO } from '../../Interfaces/DTOs/i-user-dto';
import { IGroupDTO } from '../../Interfaces/DTOs/i-group-dto';

export function toGroupRequestDTO(request: IGroupRequest | null): IGroupRequestDTO | null {
  if (!request) {
    logger.warn('Attempted to map null group request to DTO');
    return null;
  }

  // Handle groupId (populated IGroup or just an ID)
  let groupId: string;
  let group: IGroupDTO | undefined;

  if (request.groupId) {
    if (typeof request.groupId === 'string') {
      groupId = request.groupId;
    } else if (request.groupId instanceof Types.ObjectId) {
      groupId = request.groupId.toString();
    } else {
      // Assume it's an IGroup object (populated)
      groupId = (request.groupId as IGroup)._id.toString();
      const groupDTO = toGroupDTO(request.groupId as IGroup);
      group = groupDTO ?? undefined; // Convert null to undefined
    }
  } else {
    logger.warn(`Group request ${request._id} has no groupId`);
    groupId = '';
  }

  // Handle userId (populated IUser or just an ID)
  let userId: string;
  let user: IUserDTO | undefined;

  if (request.userId) {
    if (typeof request.userId === 'string') {
      userId = request.userId;
    } else if (request.userId instanceof Types.ObjectId) {
      userId = request.userId.toString();
    } else {
      // Assume it's an IUser object (populated)
      userId = (request.userId as IUser)._id.toString();
      const userDTO = toUserDTO(request.userId as IUser);
      user = userDTO ?? undefined;
    }
  } else {
    logger.warn(`Group request ${request._id} has no userId`);
    userId = '';
  }

  return {
    id: request._id.toString(),
    groupRequestId: request.groupRequestId,
    groupId,
    group,
    userId,
    user,
    status: request.status,
    paymentStatus: request.paymentStatus,
    paymentId: request.paymentId,
    amountPaid: request.amountPaid,
    createdAt: request.createdAt,
  };
}

export function toGroupRequestDTOs(requests: IGroupRequest[]): IGroupRequestDTO[] {
  return requests
    .map(toGroupRequestDTO)
    .filter((dto): dto is IGroupRequestDTO => dto !== null);
}
