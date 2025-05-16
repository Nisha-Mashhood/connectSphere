import { IReview } from '../models/Review.modal.js';
export declare const createReview: (data: {
    userId: string;
    rating: number;
    comment: string;
}) => Promise<IReview | null>;
export declare const findById: (reviewId: string) => Promise<IReview | null>;
export declare const getAllReviews: () => Promise<IReview[] | null>;
export declare const updateReview: (reviewId: string, updates: {
    isApproved?: boolean;
    isSelect?: boolean;
}) => Promise<IReview | null>;
export declare const getSelectedReviews: () => Promise<IReview[] | null>;
//# sourceMappingURL=review.repository.d.ts.map