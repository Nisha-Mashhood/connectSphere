import { IReview } from "../../Interfaces/Models/IReview";

export interface IReviewService {
  submitReview: (userId: string, rating: number, comment: string) => Promise<IReview>;
  skipReview: (userId: string) => Promise<void>;
  getAllReviews: () => Promise<IReview[]>;
  approveReview: (reviewId: string) => Promise<IReview | null>;
  selectReview: (reviewId: string) => Promise<IReview | null>;
  cancelApproval: (reviewId: string) => Promise<IReview | null>;
  deselectReview: (reviewId: string) => Promise<IReview | null>;
  getSelectedReviews: () => Promise<IReview[]>;
}