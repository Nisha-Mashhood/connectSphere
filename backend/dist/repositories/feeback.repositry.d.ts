import { IFeedback } from "../models/feedback.modal.js";
export declare const createFeedback: (feedbackData: Partial<IFeedback>) => Promise<IFeedback>;
export declare const getFeedbacksByMentorId: (mentorId: string) => Promise<IFeedback[]>;
export declare const getFeedbacksByUserId: (userId: string) => Promise<IFeedback[]>;
export declare const getFeedbackByCollaborationId: (collaborationId: string) => Promise<IFeedback | null>;
export declare const getMentorAverageRating: (mentorId: string) => Promise<number>;
//# sourceMappingURL=feeback.repositry.d.ts.map