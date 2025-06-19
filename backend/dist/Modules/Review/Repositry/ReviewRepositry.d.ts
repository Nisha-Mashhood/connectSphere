import { BaseRepository } from '../../../core/Repositries/BaseRepositry.js';
import { IReview } from '../../../Interfaces/models/IReview.js';
export declare class ReviewRepository extends BaseRepository<IReview> {
    constructor();
    private toObjectId;
    createReview(data: {
        userId: string;
        rating: number;
        comment: string;
    }): Promise<IReview>;
    findById(reviewId: string): Promise<IReview | null>;
    getAllReviews(): Promise<IReview[]>;
    updateReview(reviewId: string, updates: {
        isApproved?: boolean;
        isSelect?: boolean;
    }): Promise<IReview | null>;
    getSelectedReviews(): Promise<IReview[]>;
}
//# sourceMappingURL=ReviewRepositry.d.ts.map