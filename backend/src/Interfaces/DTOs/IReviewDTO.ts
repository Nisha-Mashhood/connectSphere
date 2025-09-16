export interface IReviewDTO {
  id: string;
  reviewId: string;
  userId: string;
  rating: number;
  comment: string;
  isApproved: boolean;
  isSelect: boolean;
  createdAt: Date;
}
