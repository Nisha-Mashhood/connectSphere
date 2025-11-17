import { IGroup, TimeSlot } from '../../Interfaces/Models/i-group';
import { IGroupDTO, TimeSlotDTO } from '../../Interfaces/DTOs/i-group-dto';
import { IUserDTO } from '../../Interfaces/DTOs/i-user-dto';
import { IUser } from '../../Interfaces/Models/i-user';
import logger from '../../core/utils/logger';
import { Types } from 'mongoose';
import { toUserDTO } from './user-mapper';

function toTimeSlotDTO(slot: TimeSlot): TimeSlotDTO {
  return {
    day: slot.day,
    timeSlots: slot.timeSlots,
  };
}

export function toGroupDTO(group: IGroup | null): IGroupDTO | null {
  if (!group) {
    logger.warn('Attempted to map null group to DTO');
    return null;
  }

  // logger.debug(`Mapping group ${group._id}: ${JSON.stringify(group, null, 2)}`);

  // Handle adminId
  let adminId: string;
  let admin: IUserDTO | undefined;

  if (group.adminId) {
    if (typeof group.adminId === 'string') {
      adminId = group.adminId;
    } else if (group.adminId instanceof Types.ObjectId) {
      adminId = group.adminId.toString();
    } else {
      // Assume it's an IUser object (populated)
      adminId = (group.adminId as IUser)._id?.toString() || '';
      const adminDTO = toUserDTO(group.adminId as IUser);
      admin = adminDTO ?? undefined;
    }
  } else {
    logger.warn(`Group ${group._id} has no adminId`);
    adminId = '';
  }

  const members: { userId: string; joinedAt: Date }[] = [];
  const membersDetails: { user: IUserDTO; joinedAt: Date }[] = [];

  if (Array.isArray(group.members) && group.members.length > 0) {
    group.members.forEach((member) => {
      // logger.debug(`Processing member for group ${group._id}: ${JSON.stringify(member, null, 2)}`);
      let memberUserId: string;
      let memberUser: IUserDTO | undefined;

      if (member.userId) {
        if (typeof member.userId === 'string') {
          memberUserId = member.userId;
        } else if (member.userId instanceof Types.ObjectId) {
          memberUserId = member.userId.toString();
        } else {
          // Assume it's an IUser object (populated)
          memberUserId = (member.userId as IUser)._id?.toString() || '';
          const memberUserDTO = toUserDTO(member.userId as IUser);
          memberUser = memberUserDTO ?? undefined;
        }
      } else {
        logger.warn(`Group ${group._id} has member with no userId`);
        memberUserId = '';
      }

      members.push({ userId: memberUserId, joinedAt: member.joinedAt || new Date() });
      if (memberUser) {
        membersDetails.push({ user: memberUser, joinedAt: member.joinedAt || new Date() });
      }
    });
  } else {
    logger.info(`Group ${group._id} has no members or members is not an array`);
  }

  return {
    id: group._id.toString(),
    groupId: group.groupId,
    name: group.name,
    bio: group.bio,
    price: group.price,
    maxMembers: group.maxMembers,
    isFull: group.isFull,
    availableSlots: group.availableSlots.map(toTimeSlotDTO),
    profilePic: group.profilePic,
    coverPic: group.coverPic,
    startDate: group.startDate,
    adminId,
    admin,
    members,
    membersDetails,
    createdAt: group.createdAt,
  };
}

export function toGroupDTOs(groups: IGroup[]): IGroupDTO[] {
  return groups
    .map(toGroupDTO)
    .filter((dto): dto is IGroupDTO => dto !== null);
}