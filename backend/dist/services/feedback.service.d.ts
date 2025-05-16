import { IFeedback } from "../models/feedback.modal.js";
export declare const createFeedback: (feedbackData: Partial<IFeedback>) => Promise<IFeedback>;
export declare const getMentorFeedbacks: (mentorId: string) => Promise<{
    feedbacks: IFeedback[];
    averageRating: number;
    totalFeedbacks: number;
}>;
export declare const getUserFeedbacks: (userId: string) => Promise<IFeedback[]>;
export declare const getFeedbackForProfile: (profileId: string, profileType: "mentor" | "user") => Promise<{
    feedbacks: IFeedback[];
    totalFeedbacks: number;
}>;
export declare const getFeedbackByCollaborationId: (collabId: string) => Promise<IFeedback[]>;
export declare const toggleFeedbackservice: (feedbackId: string) => Promise<import("mongoose").Document<unknown, {}, IFeedback> & IFeedback & Required<{
    _id: unknown;
}> & {
    __v: number;
}>;
export declare const getFeedBackByMentorIdService: (mentorId: string) => Promise<IFeedback[]>;
//# sourceMappingURL=feedback.service.d.ts.map