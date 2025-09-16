import { IFeedbackDTO } from '../../Interfaces/DTOs/IFeedBackDTO';
import { IFeedback } from '../../Interfaces/Models/IFeedback';


export function toFeedbackDTO(feedback: IFeedback | null): IFeedbackDTO | null {
  if (!feedback) return null;

  return {
    feedbackId: feedback.feedbackId,
    userId: feedback.userId.toString(),
    mentorId: feedback.mentorId.toString(),
    collaborationId: feedback.collaborationId.toString(),
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
  return feedbacks.map(toFeedbackDTO).filter((dto): dto is IFeedbackDTO => dto !== null);
}
