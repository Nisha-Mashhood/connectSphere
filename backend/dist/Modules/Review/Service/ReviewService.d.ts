import { BaseService } from '../../../core/Services/BaseService.js';
import { IReview } from '../../../Interfaces/models/IReview.js';
export declare class ReviewService extends BaseService {
    private reviewRepo;
    private userRepo;
    constructor();
    submitReview(userId: string, rating: number, comment: string): Promise<IReview>;
    skipReview(userId: string): Promise<void>;
    getAllReviews(): Promise<IReview[]>;
    approveReview(reviewId: string): Promise<IReview | null>;
    selectReview(reviewId: string): Promise<IReview | null>;
    cancelApproval(reviewId: string): Promise<IReview | null>;
    deselectReview(reviewId: string): Promise<IReview | null>;
    getSelectedReviews(): Promise<IReview[]>;
}
//# sourceMappingURL=ReviewService.d.ts.map