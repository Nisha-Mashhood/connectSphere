import { BaseRepository } from '../../../core/Repositries/BaseRepositry.js';
import { IFeedback } from '../../../Interfaces/models/IFeedback.js';
export declare class FeedbackRepository extends BaseRepository<IFeedback> {
    constructor();
    private toObjectId;
    createFeedback: (feedbackData: Partial<IFeedback>) => Promise<IFeedback>;
    getFeedbacksByMentorId: (mentorId: string) => Promise<IFeedback[]>;
    getFeedbacksByUserId: (userId: string) => Promise<IFeedback[]>;
    getFeedbackByCollaborationId: (collaborationId: string) => Promise<IFeedback[]>;
    getMentorAverageRating: (mentorId: string) => Promise<number>;
    getFeedbackForProfile: (profileId: string, profileType: "mentor" | "user") => Promise<IFeedback[]>;
    toggleIsHidden: (feedbackId: string) => Promise<IFeedback>;
}
//# sourceMappingURL=FeedBackRepositry.d.ts.map