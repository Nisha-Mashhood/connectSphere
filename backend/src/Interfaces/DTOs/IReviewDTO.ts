import { IUserDTO } from './IUserDTO';

export interface IReviewDTO {
  id: string;
  reviewId: string;
  userId: string;
  user?: IUserDTO; // Populated user details when available
  rating: number;
  comment: string;
  isApproved: boolean;
  isSelect: boolean;
  createdAt: Date;
}