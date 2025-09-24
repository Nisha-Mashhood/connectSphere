import { Types } from 'mongoose';
import { IMentor } from '../../Interfaces/Models/i-mentor';
import { IMentorDTO } from '../../Interfaces/DTOs/i-mentor-dto';
import { toUserDTO } from './user-mapper';
import { toSkillDTOs } from './skill-mapper';
import { IUser } from '../../Interfaces/Models/i-user';
import { ISkill } from '../../Interfaces/Models/i-skill';
import logger from '../../core/Utils/logger';
import { IUserDTO } from '../../Interfaces/DTOs/i-user-dto';
import { ISkillDTO } from '../../Interfaces/DTOs/i-skill-dto';

export function toMentorDTO(mentor: IMentor | null): IMentorDTO | null {
  if (!mentor) {
    logger.warn('Attempted to map null mentor to DTO');
    return null;
  }

  // Handle userId
  let userId: string;
  let user: IUserDTO | undefined;

  if (mentor.userId) {
    if (typeof mentor.userId === 'string') {
      userId = mentor.userId;
    } else if (mentor.userId instanceof Types.ObjectId) {
      userId = mentor.userId.toString();
    } else {
      // IUser object (populated)
      userId = (mentor.userId as IUser)._id.toString();
      const userDTO = toUserDTO(mentor.userId as IUser);
      user = userDTO ?? undefined; 
    }
  } else {
    logger.warn(`Mentor ${mentor._id} has no userId`);
    userId = '';
  }

  // Handle skills (string[] or ISkill[])
  let skills: string[] | undefined = [];
  let skillsDetails: ISkillDTO[] | undefined = [];

  if (mentor.skills) {
    if (mentor.skills.every((skill) => typeof skill === 'string')) {
      skills = mentor.skills as string[];
    } else if (mentor.skills.every((skill) => typeof skill === 'object' && skill !== null && 'name' in skill)) {
      // ISkill[] (populated)
      skillsDetails = toSkillDTOs(mentor.skills as ISkill[]);
      skills = skillsDetails.map((skill) => skill.name);
    } else {
      logger.warn(`Mentor ${mentor._id} has invalid skills format`);
    }
  } else {
    logger.warn(`Mentor ${mentor._id} has no skills`);
  }

  return {
    id: mentor._id.toString(),
    mentorId: mentor.mentorId,
    userId,
    user,
    isApproved: mentor.isApproved,
    rejectionReason: mentor.rejectionReason,
    skills,
    skillsDetails,
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
  return mentors
    .map(toMentorDTO)
    .filter((dto): dto is IMentorDTO => dto !== null);
}