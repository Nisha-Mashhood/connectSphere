import { Types } from 'mongoose';
import { IMentor } from '../../Interfaces/Models/i-mentor';
import { IMentorDTO } from '../../Interfaces/DTOs/i-mentor-dto';
import { toUserDTO } from './user-mapper';
import { toSkillDTOs } from './skill-mapper';
import { IUser } from '../../Interfaces/Models/i-user';
import { ISkill } from '../../Interfaces/Models/i-skill';
import logger from '../../core/utils/logger';
import { IUserDTO } from '../../Interfaces/DTOs/i-user-dto';
import { ISkillDTO } from '../../Interfaces/DTOs/i-skill-dto';

type SkillType = string | Types.ObjectId | ISkill;

export function toMentorDTO(mentor: IMentor | null): IMentorDTO | null {
  if (!mentor) {
    logger.warn('Attempted to map null mentor to DTO');
    return null;
  }

  // Handle _id
  if (!mentor._id) {
    logger.error(`Mentor has no _id: ${JSON.stringify(mentor)}`);
    return null;
  }
  const id = mentor._id.toString();
  logger.debug(`Mentor ID: ${id}`);

  // Handle userId
  let userId: string = '';
  let user: IUserDTO | undefined;

  if (!mentor.userId) {
    logger.warn(`Mentor ${id} has no userId`);
  } else if (typeof mentor.userId === 'string') {
    userId = mentor.userId;
    logger.debug(`Mentor ${id} userId is string: ${userId}`);
  } else if (mentor.userId instanceof Types.ObjectId) {
    userId = mentor.userId.toString();
    logger.debug(`Mentor ${id} userId is ObjectId: ${userId}`);
  } else if (typeof mentor.userId === 'object' && '_id' in mentor.userId) {
    // Populated IUser object
    userId = (mentor.userId as IUser)._id.toString();
    logger.debug(`Mentor ${id} userId is populated, _id: ${userId}`);
    const userDTO = toUserDTO(mentor.userId as IUser);
    if (!userDTO) {
      logger.warn(`Failed to convert user to DTO for mentor ${id}`);
    } else {
      user = userDTO;
    }
  } else {
    logger.error(`Invalid userId format for mentor ${id}: ${JSON.stringify(mentor.userId)}`);
  }

  // Handle skills
let skills: string[] = [];
let skillsDetails: ISkillDTO[] = [];

if (!mentor.skills) {
  logger.warn(`Mentor ${id} has no skills`);
} else if (
  mentor.skills.every(
    (skill: SkillType) =>
      typeof skill === "string" || skill instanceof Types.ObjectId
  )
) {
  // Non-populated skills: array of ObjectIds or strings
  skills = mentor.skills?.map((s) =>
    typeof s === "string" ? s : s.toString()
  );
  logger.debug(
    `Mentor ${id} has non-populated skills (IDs): ${skills.join(", ")}`
  );
} else if (
  mentor.skills.every(
    (skill) => typeof skill === "object" && skill !== null && "name" in skill
  )
) {
  // Populated ISkill objects
  skillsDetails = toSkillDTOs(mentor.skills as ISkill[]);
  skills = skillsDetails.map((skill) => skill.name);
  logger.debug(
    `Mentor ${id} has populated skills: ${skills.join(", ")}`
  );
} else {
  logger.error(
    `Invalid skills format for mentor ${id}: ${JSON.stringify(
      mentor.skills
    )}`
  );
}

  const mentorDTO: IMentorDTO = {
    id,
    mentorId: mentor.mentorId,
    userId,
    user,
    isApproved: mentor.isApproved,
    rejectionReason: mentor.rejectionReason,
    skills,
    skillsDetails,
    certifications: mentor.certifications || [],
    specialization: mentor.specialization || '',
    bio: mentor.bio || '',
    price: mentor.price || 0,
    availableSlots: mentor.availableSlots || [],
    timePeriod: mentor.timePeriod,
    createdAt: mentor.createdAt,
    updatedAt: mentor.updatedAt,
  };

  // logger.debug(`Mentor DTO created for ${id}: ${JSON.stringify(mentorDTO, null, 2)}`);
  return mentorDTO;
}

export function toMentorDTOs(mentors: IMentor[]): IMentorDTO[] {
  logger.debug(`Mapping ${mentors.length} mentors to DTOs`);
  const dtos = mentors
    .map((mentor, index) => {
      logger.debug(`Processing mentor at index ${index}`);
      const dto = toMentorDTO(mentor);
      if (!dto) {
        logger.warn(`Skipping null DTO for mentor at index ${index}`);
      }
      return dto;
    })
    .filter((dto): dto is IMentorDTO => dto !== null);
  logger.info(`Successfully mapped ${dtos.length} mentor DTOs`);
  return dtos;
}