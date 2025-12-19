import { Types } from 'mongoose';
import { IMentorExperience } from '../../Interfaces/Models/i-mentor-experience';
import { IMentorExperienceDTO } from '../../Interfaces/DTOs/i-mentor-experience-dto';
import logger from '../../core/utils/logger';

export function toMentorExperienceDTO(
  experience: IMentorExperience | null
): IMentorExperienceDTO | null {
  if (!experience) {
    logger.warn('Attempted to map null mentor experience to DTO');
    return null;
  }

  if (!experience._id) {
    logger.error(`Mentor experience has no _id: ${JSON.stringify(experience)}`);
    return null;
  }

  const id = experience._id.toString();

  const dto: IMentorExperienceDTO = {
    id,
    mentorExperienceId: experience.mentorExperienceId,
    mentorId: experience.mentorId instanceof Types.ObjectId
      ? experience.mentorId.toString()
      : experience.mentorId,
    role: experience.role,
    organization: experience.organization,
    startDate: experience.startDate,
    endDate: experience.endDate || null,
    isCurrent: experience.isCurrent,
    description: experience.description || null,
    createdAt: experience.createdAt || new Date(),
    updatedAt: experience.updatedAt || new Date(),
  };

  logger.debug(`Mapped mentor experience DTO: ${id}`);
  return dto;
}

export function toMentorExperienceDTOs(
  experiences: IMentorExperience[]
): IMentorExperienceDTO[] {
  logger.debug(`Mapping ${experiences.length} mentor experiences to DTOs`);

  const dtos = experiences
    .map((exp, index) => {
      logger.debug(`Processing experience at index ${index}`);
      const dto = toMentorExperienceDTO(exp);
      if (!dto) {
        logger.warn(`Skipping null DTO for experience at index ${index}`);
      }
      return dto;
    })
    .filter((dto): dto is IMentorExperienceDTO => dto !== null);

  logger.info(`Successfully mapped ${dtos.length} mentor experience DTOs`);
  return dtos;
}