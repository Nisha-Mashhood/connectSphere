import { IMentorRequest } from '../../Interfaces/Models/IMentorRequest';
import { IMentorRequestDTO } from '../../Interfaces/DTOs/IMentorRequestDTO';
import { toUserDTO } from './UserMapper';
import { toMentorDTO } from './mentorMapper';
import { IMentor } from '../../Interfaces/Models/IMentor';
import { IUser } from '../../Interfaces/Models/IUser';
import logger from '../../Core/Utils/Logger';
import { Types } from 'mongoose';
import { IMentorDTO } from '../../Interfaces/DTOs/IMentorDTO';
import { IUserDTO } from '../../Interfaces/DTOs/IUserDTO';

export function toMentorRequestDTO(request: IMentorRequest | null): IMentorRequestDTO | null {
  if (!request) {
    logger.warn('Attempted to map null mentor request to DTO');
    return null;
  }

  // Handle mentorId
  let mentorId: string;
  let mentor: IMentorDTO | undefined;

  if (request.mentorId) {
    if (typeof request.mentorId === 'string') {
      mentorId = request.mentorId;
    } else if (request.mentorId instanceof Types.ObjectId) {
      mentorId = request.mentorId.toString();
    } else {
      // IMentor object (populated)
      mentorId = (request.mentorId as IMentor)._id.toString();
      const mentorDTO = toMentorDTO(request.mentorId as IMentor);
      mentor = mentorDTO ?? undefined;
    }
  } else {
    logger.warn(`Mentor request ${request._id} has no mentorId`);
    mentorId = '';
  }

  // Handle userId
  let userId: string;
  let user: IUserDTO | undefined;

  if (request.userId) {
    if (typeof request.userId === 'string') {
      userId = request.userId;
    } else if (request.userId instanceof Types.ObjectId) {
      userId = request.userId.toString();
    } else {
      // IUser object (populated)
      userId = (request.userId as IUser)._id.toString();
      const userDTO = toUserDTO(request.userId as IUser);
      user = userDTO ?? undefined;
    }
  } else {
    logger.warn(`Mentor request ${request._id} has no userId`);
    userId = '';
  }

  return {
    id: request._id.toString(),
    mentorRequestId: request.mentorRequestId,
    mentorId,
    mentor,
    userId,
    user,
    selectedSlot: request.selectedSlot
      ? {
          day: request.selectedSlot.day,
          timeSlots: request.selectedSlot.timeSlots, 
        }
      : undefined,
    price: request.price,
    paymentStatus: request.paymentStatus, // Now matches "Pending" | "Paid" | "Failed"
    timePeriod: request.timePeriod,
    isAccepted: request.isAccepted, // Now matches "Pending" | "Accepted" | "Rejected"
    createdAt: request.createdAt,
  };
}

export function toMentorRequestDTOs(requests: IMentorRequest[]): IMentorRequestDTO[] {
  return requests
    .map(toMentorRequestDTO)
    .filter((dto): dto is IMentorRequestDTO => dto !== null);
}