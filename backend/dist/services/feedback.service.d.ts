import { IFeedback } from "../models/feedback.modal.js";
export declare const createFeedback: (feedbackData: Partial<IFeedback>) => Promise<IFeedback>;
export declare const getMentorFeedbacks: (mentorId: string) => Promise<{
    feedbacks: IFeedback[];
    averageRating: number;
    totalFeedbacks: number;
}>;
export declare const getUserFeedbacks: (userId: string) => Promise<IFeedback[]>;
export declare const getFeedbackByRole: (role: "user" | "mentor", userId: string, collaborationId: string) => Promise<IFeedback>;
//# sourceMappingURL=feedback.service.d.ts.map