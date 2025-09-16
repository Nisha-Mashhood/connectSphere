import { IFeedback } from "../../Interfaces/Models/IFeedback";

export interface IFeedbackService {
  createFeedback: (feedbackData: Partial<IFeedback>) => Promise<IFeedback>;
  getMentorFeedbacks: (mentorId: string) => Promise<{
    feedbacks: IFeedback[];
    averageRating: number;
    totalFeedbacks: number;
  }>;
  getUserFeedbacks: (userId: string) => Promise<IFeedback[]>;
  getFeedbackForProfile: (
    profileId: string,
    profileType: "mentor" | "user"
  ) => Promise<{
    feedbacks: IFeedback[];
    totalFeedbacks: number;
  }>;
  getFeedbackByCollaborationId: (collabId: string) => Promise<IFeedback[]>;
  toggleFeedback: (feedbackId: string) => Promise<IFeedback>;
  getFeedbackByMentorId: (mentorId: string) => Promise<IFeedback[]>;
}