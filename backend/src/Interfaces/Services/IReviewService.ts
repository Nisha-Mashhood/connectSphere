import { IReviewDTO } from "../DTOs/IReviewDTO";

export interface IReviewService {
  submitReview: (userId: string, rating: number, comment: string) => Promise<IReviewDTO>;
  skipReview: (userId: string) => Promise<void>;
  getAllReviews: () => Promise<IReviewDTO[]>;
  approveReview: (reviewId: string) => Promise<IReviewDTO | null>;
  selectReview: (reviewId: string) => Promise<IReviewDTO | null>;
  cancelApproval: (reviewId: string) => Promise<IReviewDTO | null>;
  deselectReview: (reviewId: string) => Promise<IReviewDTO | null>;
  getSelectedReviews: () => Promise<IReviewDTO[]>;
}