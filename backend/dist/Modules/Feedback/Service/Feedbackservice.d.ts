import { BaseService } from '../../../core/Services/BaseService.js';
import { IFeedback } from '../../../Interfaces/models/IFeedback.js';
export declare class FeedbackService extends BaseService {
    private feedbackRepo;
    private collabRepo;
    constructor();
    createFeedback(feedbackData: Partial<IFeedback>): Promise<IFeedback>;
    getMentorFeedbacks(mentorId: string): Promise<{
        feedbacks: IFeedback[];
        averageRating: number;
        totalFeedbacks: number;
    }>;
    getUserFeedbacks(userId: string): Promise<IFeedback[]>;
    getFeedbackForProfile(profileId: string, profileType: 'mentor' | 'user'): Promise<{
        feedbacks: IFeedback[];
        totalFeedbacks: number;
    }>;
    getFeedbackByCollaborationId(collabId: string): Promise<IFeedback[]>;
    toggleFeedback(feedbackId: string): Promise<IFeedback>;
    getFeedbackByMentorId(mentorId: string): Promise<IFeedback[]>;
}
//# sourceMappingURL=Feedbackservice.d.ts.map