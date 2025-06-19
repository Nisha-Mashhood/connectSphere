import { IFeedback } from "../Interfaces/models/IFeedback.js";
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
export declare const getFeedbackForProfile: (profileId: string, profileType: "mentor" | "user") => Promise<IFeedback[]>;
export declare const toggleisHidden: (feedbackId: string) => Promise<mongoose.Document<unknown, {}, IFeedback> & IFeedback & Required<{
    _id: unknown;
}> & {
    __v: number;
}>;
//# sourceMappingURL=feeback.repositry.d.ts.map