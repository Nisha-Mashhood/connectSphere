import { IReview } from '../Models/i-review';

export interface IReviewRepository {
  createReview(data: { userId: string; rating: number; comment: string }): Promise<IReview>;
  findReviewById(reviewId: string): Promise<IReview | null>;
  getAllReviews(params: { page?: number, limit?: number, search?: string, }): Promise<{ reviews: IReview[]; total: number; page: number; pages: number }>;
  updateReview(reviewId: string, updates: { isApproved?: boolean; isSelect?: boolean }): Promise<IReview | null>;
  getSelectedReviews(): Promise<IReview[]>;
}