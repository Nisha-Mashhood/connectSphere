import { IReviewDTO } from "../DTOs/i-review-dto";

export interface IReviewService {
  submitReview: (userId: string, rating: number, comment: string) => Promise<IReviewDTO>;
  skipReview: (userId: string) => Promise<void>;
  getAllReviews: (params: { page?: number, limit?: number, search?: string }) => Promise<{
    reviews: IReviewDTO[];
    total: number;
    page: number;
    pages: number;
  }>;
  approveReview: (reviewId: string) => Promise<IReviewDTO | null>;
  selectReview: (reviewId: string) => Promise<IReviewDTO | null>;
  cancelApproval: (reviewId: string) => Promise<IReviewDTO | null>;
  deselectReview: (reviewId: string) => Promise<IReviewDTO | null>;
  getSelectedReviews: () => Promise<IReviewDTO[]>;
}