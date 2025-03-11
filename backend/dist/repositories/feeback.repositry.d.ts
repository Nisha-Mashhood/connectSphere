import { IFeedback } from "../models/feedback.modal.js";
import mongoose from "mongoose";
export declare const createFeedback: (feedbackData: Partial<IFeedback>) => Promise<IFeedback>;
export declare const getFeedbacksByMentorId: (mentorId: string) => Promise<IFeedback[]>;
export declare const getFeedbacksByUserId: (userId: string) => Promise<IFeedback[]>;
export declare const getFeedbackByCollaborationId: (collaborationId: string) => Promise<(mongoose.Document<unknown, {}, IFeedback> & IFeedback & Required<{
    _id: unknown;
}> & {
    __v: number;
})[]>;
export declare const getMentorAverageRating: (mentorId: string) => Promise<number>;
//# sourceMappingURL=feeback.repositry.d.ts.map