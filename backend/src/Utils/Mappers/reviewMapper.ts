import { IReview } from '../../Interfaces/Models/IReview';
import { IReviewDTO } from '../../Interfaces/DTOs/IReviewDTO';

export function toReviewDTO(review: IReview | null): IReviewDTO | null {
  if (!review) return null;

  return {
    id: review._id.toString(),
    reviewId: review.reviewId,
    userId: review.userId.toString(),
    rating: review.rating,
    comment: review.comment,
    isApproved: review.isApproved,
    isSelect: review.isSelect,
    createdAt: review.createdAt,
  };
}

export function toReviewDTOs(reviews: IReview[]): IReviewDTO[] {
  return reviews.map(toReviewDTO).filter((dto): dto is IReviewDTO => dto !== null);
}
