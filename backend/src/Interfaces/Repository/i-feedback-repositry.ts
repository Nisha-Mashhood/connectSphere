import { IFeedback } from '../Models/i-feedback';

export interface IFeedbackRepository {
  createFeedback(feedbackData: Partial<IFeedback>): Promise<IFeedback>;
  getFeedbacksByMentorId(mentorId: string): Promise<IFeedback[]>;
  getFeedbacksByUserId(userId: string): Promise<IFeedback[]>;
  getFeedbackByCollaborationId(collaborationId: string): Promise<IFeedback[]>;
  getMentorAverageRating(mentorId: string): Promise<number>;
  getFeedbackForProfile(profileId: string, profileType: 'mentor' | 'user'): Promise<IFeedback[]>;
  toggleIsHidden(feedbackId: string): Promise<IFeedback | null>;
}