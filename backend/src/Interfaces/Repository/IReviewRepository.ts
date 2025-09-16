import { IReview } from '../../Interfaces/Models/IReview';

export interface IReviewRepository {
  createReview(data: { userId: string; rating: number; comment: string }): Promise<IReview>;
  findReviewById(reviewId: string): Promise<IReview | null>;
  getAllReviews(): Promise<IReview[]>;
  updateReview(reviewId: string, updates: { isApproved?: boolean; isSelect?: boolean }): Promise<IReview | null>;
  getSelectedReviews(): Promise<IReview[]>;
}