import { IMentor } from '../../Interfaces/Models/IMentor';
import { IMentorDTO } from '../../Interfaces/DTOs/IMentorDTO';

export function toMentorDTO(mentor: IMentor | null): IMentorDTO | null {
  if (!mentor) return null;

  return {
    id: mentor._id.toString(),
    mentorId: mentor.mentorId,
    userId: typeof mentor.userId === 'string' ? mentor.userId : mentor.userId._id.toString(),
    isApproved: mentor.isApproved,
    rejectionReason: mentor.rejectionReason,
    skills: mentor.skills,
    certifications: mentor.certifications,
    specialization: mentor.specialization,
    bio: mentor.bio,
    price: mentor.price,
    availableSlots: mentor.availableSlots,
    timePeriod: mentor.timePeriod,
    createdAt: mentor.createdAt,
    updatedAt: mentor.updatedAt,
  };
}

export function toMentorDTOs(mentors: IMentor[]): IMentorDTO[] {
  return mentors.map(toMentorDTO).filter((dto): dto is IMentorDTO => dto !== null);
}
