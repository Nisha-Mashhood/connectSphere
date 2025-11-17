import { ICollaboration } from '../../Interfaces/Models/i-collaboration';
import { ICollaborationDTO, SelectedSlotDTO, UnavailableDayDTO, TemporarySlotChangeDTO } from '../../Interfaces/DTOs/i-collaboration-dto';
import { toUserDTO } from './user-mapper';
import { toMentorDTO } from './mentor-mapper';
import { IMentor } from '../../Interfaces/Models/i-mentor';
import { IUser } from '../../Interfaces/Models/i-user';
import logger from '../../core/utils/logger';
import { Types } from 'mongoose';
import { IUserDTO } from '../../Interfaces/DTOs/i-user-dto';
import { IMentorDTO } from '../../Interfaces/DTOs/i-mentor-dto';

function toSelectedSlotDTO(slot: { day: string; timeSlots: string[] }): SelectedSlotDTO {
  return {
    day: slot.day as SelectedSlotDTO['day'],
    timeSlots: slot.timeSlots,
  };
}

function toUnavailableDayDTO(day: {
  _id: Types.ObjectId;
  datesAndReasons: { date: Date; reason: string }[];
  requestedBy: "user" | "mentor";
  requesterId: Types.ObjectId;
  isApproved: "pending" | "approved" | "rejected";
  approvedById: Types.ObjectId;
}): UnavailableDayDTO {
  return {
    id: day._id.toString(),
    datesAndReasons: day.datesAndReasons,
    requestedBy: day.requestedBy,
    requesterId: day.requesterId.toString(),
    isApproved: day.isApproved,
    approvedById: day.approvedById.toString(),
  };
}

function toTemporarySlotChangeDTO(change: {
  _id: Types.ObjectId;
  datesAndNewSlots: { date: Date; newTimeSlots: string[] }[];
  requestedBy: "user" | "mentor";
  requesterId: Types.ObjectId;
  isApproved: "pending" | "approved" | "rejected";
  approvedById: Types.ObjectId;
}): TemporarySlotChangeDTO {
  return {
    id: change._id.toString(),
    datesAndNewSlots: change.datesAndNewSlots,
    requestedBy: change.requestedBy,
    requesterId: change.requesterId.toString(),
    isApproved: change.isApproved,
    approvedById: change.approvedById.toString(),
  };
}

export function toCollaborationDTO(collaboration: ICollaboration | null): ICollaborationDTO | null {
  if (!collaboration) {
    logger.warn('Attempted to map null collaboration to DTO');
    return null;
  }

  //mentorId
  let mentorId: string;
  let mentor: IMentorDTO | undefined;

  if (collaboration.mentorId) {
    if (typeof collaboration.mentorId === 'string') {
      mentorId = collaboration.mentorId;
    } else if (collaboration.mentorId instanceof Types.ObjectId) {
      mentorId = collaboration.mentorId.toString();
    } else {
      // IMentor object (populated)
      mentorId = (collaboration.mentorId as IMentor)._id.toString();
      const mentorDTO = toMentorDTO(collaboration.mentorId as IMentor);
      mentor = mentorDTO ?? undefined;
    }
  } else {
    logger.warn(`Collaboration ${collaboration._id} has no mentorId`);
    mentorId = '';
  }

  // HuserId
  let userId: string;
  let user: IUserDTO | undefined;

  if (collaboration.userId) {
    if (typeof collaboration.userId === 'string') {
      userId = collaboration.userId;
    } else if (collaboration.userId instanceof Types.ObjectId) {
      userId = collaboration.userId.toString();
    } else {
      // IUser object (populated)
      userId = (collaboration.userId as IUser)._id.toString();
      const userDTO = toUserDTO(collaboration.userId as IUser);
      user = userDTO ?? undefined;
    }
  } else {
    logger.warn(`Collaboration ${collaboration._id} has no userId`);
    userId = '';
  }

  return {
    id: collaboration._id.toString(),
    collaborationId: collaboration.collaborationId,
    mentorId,
    mentor,
    userId,
    user,
    selectedSlot: collaboration.selectedSlot.map(toSelectedSlotDTO),
    unavailableDays: collaboration.unavailableDays.map(toUnavailableDayDTO),
    temporarySlotChanges: collaboration.temporarySlotChanges.map(toTemporarySlotChangeDTO),
    price: collaboration.price,
    payment: collaboration.payment,
    paymentIntentId: collaboration.paymentIntentId,
    isCancelled: collaboration.isCancelled,
    isCompleted: collaboration.isCompleted,
    startDate: collaboration.startDate,
    endDate: collaboration.endDate,
    feedbackGiven: collaboration.feedbackGiven,
    createdAt: collaboration.createdAt,
  };
}

export function toCollaborationDTOs(collaborations: ICollaboration[]): ICollaborationDTO[] {
  return collaborations
    .map(toCollaborationDTO)
    .filter((dto): dto is ICollaborationDTO => dto !== null);
}