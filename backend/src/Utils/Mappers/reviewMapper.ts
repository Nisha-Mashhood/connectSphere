import { IReview } from '../../Interfaces/Models/IReview';
import { IReviewDTO } from '../../Interfaces/DTOs/IReviewDTO';
import { toUserDTO } from './UserMapper';
import { IUser } from '../../Interfaces/Models/IUser';
import logger from '../../Core/Utils/Logger';
import { Types } from 'mongoose';
import { IUserDTO } from '../../Interfaces/DTOs/IUserDTO';

export function toReviewDTO(review: IReview | null): IReviewDTO | null {
  if (!review) {
    logger.warn('Attempted to map null review to DTO');
    return null;
  }

  //userId (populated IUser or just an ID)
  let userId: string;
  let user: IUserDTO | undefined;

  if (review.userId) {
    if (typeof review.userId === 'string') {
      userId = review.userId;
    } else if (review.userId instanceof Types.ObjectId) {
      userId = review.userId.toString();
    } else {
      //IUser object (populated)
      userId = (review.userId as IUser)._id.toString();
      const userDTO = toUserDTO(review.userId as IUser);
      user = userDTO ?? undefined;
    }
  } else {
    logger.warn(`Review ${review._id} has no userId`);
    userId = '';
  }

  return {
    id: review._id.toString(),
    reviewId: review.reviewId,
    userId,
    user,
    rating: review.rating,
    comment: review.comment,
    isApproved: review.isApproved,
    isSelect: review.isSelect,
    createdAt: review.createdAt,
  };
}

export function toReviewDTOs(reviews: IReview[]): IReviewDTO[] {
  return reviews
    .map(toReviewDTO)
    .filter((dto): dto is IReviewDTO => dto !== null);
}