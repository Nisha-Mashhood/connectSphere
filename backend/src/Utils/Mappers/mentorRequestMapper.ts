import { IMentorRequest } from '../../Interfaces/Models/IMentorRequest';
import { IMentorRequestDTO } from '../../Interfaces/DTOs/IMentorRequestDTO';

export function toMentorRequestDTO(request: IMentorRequest | null): IMentorRequestDTO | null {
  if (!request) return null;

  return {
    id: request._id.toString(),
    mentorRequestId: request.mentorRequestId,
    mentorId: request.mentorId.toString(),
    userId: request.userId.toString(),
    selectedSlot: {
      day: request.selectedSlot.day,
      timeSlots: request.selectedSlot.timeSlots,
    },
    price: request.price,
    timePeriod: request.timePeriod,
    paymentStatus: request.paymentStatus,
    isAccepted: request.isAccepted,
    createdAt: request.createdAt,
    updatedAt: request.updatedAt,
  };
}

export function toMentorRequestDTOs(requests: IMentorRequest[]): IMentorRequestDTO[] {
  return requests.map(toMentorRequestDTO).filter((dto): dto is IMentorRequestDTO => dto !== null);
}
