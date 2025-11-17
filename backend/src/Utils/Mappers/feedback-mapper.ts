import { IFeedback } from '../../Interfaces/Models/i-feedback';
import { toUserDTO } from './user-mapper';
import { toMentorDTO } from './mentor-mapper';
import { toCollaborationDTO } from './collaboration-mapper';
import { IUser } from '../../Interfaces/Models/i-user';
import { IMentor } from '../../Interfaces/Models/i-mentor';
import { ICollaboration } from '../../Interfaces/Models/i-collaboration';
import logger from '../../core/utils/logger';
import { Types } from 'mongoose';
import { IUserDTO } from '../../Interfaces/DTOs/i-user-dto';
import { IMentorDTO } from '../../Interfaces/DTOs/i-mentor-dto';
import { ICollaborationDTO } from '../../Interfaces/DTOs/i-collaboration-dto';
import { IFeedbackDTO } from '../../Interfaces/DTOs/i-feedback-dto';

export function toFeedbackDTO(feedback: IFeedback | null): IFeedbackDTO | null {
  if (!feedback) {
    logger.warn('Attempted to map null feedback to DTO');
    return null;
  }

  //userId (populated IUser or just an ID)
  let userId: string;
  let user: IUserDTO | undefined;

  if (feedback.userId) {
    if (typeof feedback.userId === 'string') {
      userId = feedback.userId;
    } else if (feedback.userId instanceof Types.ObjectId) {
      userId = feedback.userId.toString();
    } else {
      //IUser object (populated)
      userId = (feedback.userId as IUser)._id.toString();
      const userDTO = toUserDTO(feedback.userId as IUser);
      user = userDTO ?? undefined;
    }
  } else {
    logger.warn(`Feedback ${feedback._id} has no userId`);
    userId = '';
  }

  //mentorId (populated IMentor or just an ID)
  let mentorId: string;
  let mentor: IMentorDTO | undefined;

  if (feedback.mentorId) {
    if (typeof feedback.mentorId === 'string') {
      mentorId = feedback.mentorId;
    } else if (feedback.mentorId instanceof Types.ObjectId) {
      mentorId = feedback.mentorId.toString();
    } else {
      //IMentor object (populated)
      mentorId = (feedback.mentorId as IMentor)._id.toString();
      const mentorDTO = toMentorDTO(feedback.mentorId as IMentor);
      mentor = mentorDTO ?? undefined;
    }
  } else {
    logger.warn(`Feedback ${feedback._id} has no mentorId`);
    mentorId = '';
  }

  //collaborationId (populated ICollaboration or just an ID)
  let collaborationId: string;
  let collaboration: ICollaborationDTO | undefined;

  if (feedback.collaborationId) {
    if (typeof feedback.collaborationId === 'string') {
      collaborationId = feedback.collaborationId;
    } else if (feedback.collaborationId instanceof Types.ObjectId) {
      collaborationId = feedback.collaborationId.toString();
    } else {
      //ICollaboration object (populated)
      collaborationId = (feedback.collaborationId as ICollaboration)._id.toString();
      const collaborationDTO = toCollaborationDTO(feedback.collaborationId as ICollaboration);
      collaboration = collaborationDTO ?? undefined;
    }
  } else {
    logger.warn(`Feedback ${feedback._id} has no collaborationId`);
    collaborationId = '';
  }

  return {
    id: feedback._id.toString(),
    feedbackId: feedback.feedbackId,
    userId,
    user,
    mentorId,
    mentor,
    collaborationId,
    collaboration,
    givenBy: feedback.givenBy,
    rating: feedback.rating,
    communication: feedback.communication,
    expertise: feedback.expertise,
    punctuality: feedback.punctuality,
    comments: feedback.comments,
    wouldRecommend: feedback.wouldRecommend,
    isHidden: feedback.isHidden,
    createdAt: feedback.createdAt,
  };
}

export function toFeedbackDTOs(feedbacks: IFeedback[]): IFeedbackDTO[] {
  return feedbacks
    .map(toFeedbackDTO)
    .filter((dto): dto is IFeedbackDTO => dto !== null);
}