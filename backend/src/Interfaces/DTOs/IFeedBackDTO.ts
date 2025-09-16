export interface IFeedbackDTO {
  feedbackId: string;
  userId: string;
  mentorId: string;
  collaborationId: string;
  givenBy: "user" | "mentor";
  rating: number;
  communication: number;
  expertise: number;
  punctuality: number;
  comments: string;
  wouldRecommend: boolean;
  isHidden: boolean;
  createdAt: Date;
}
