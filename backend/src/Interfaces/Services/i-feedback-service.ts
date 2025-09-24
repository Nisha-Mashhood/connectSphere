import { IFeedback } from "../Models/i-feedback";
import { IFeedbackDTO } from "../DTOs/i-feedback-dto";

export interface IFeedbackService {
  createFeedback: (feedbackData: Partial<IFeedback>) => Promise<IFeedbackDTO>;
  getMentorFeedbacks: (mentorId: string) => Promise<{
    feedbacks: IFeedbackDTO[];
    averageRating: number;
    totalFeedbacks: number;
  }>;
  getUserFeedbacks: (userId: string) => Promise<IFeedbackDTO[]>;
  getFeedbackForProfile: (
    profileId: string,
    profileType: "mentor" | "user"
  ) => Promise<{
    feedbacks: IFeedbackDTO[];
    totalFeedbacks: number;
  }>;
  getFeedbackByCollaborationId: (collabId: string) => Promise<IFeedbackDTO[]>;
  toggleFeedback: (feedbackId: string) => Promise<IFeedbackDTO>;
  getFeedbackByMentorId: (mentorId: string) => Promise<IFeedbackDTO[]>;
}