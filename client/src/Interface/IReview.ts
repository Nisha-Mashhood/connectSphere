export interface Review {
  id: string;                
  reviewId: string;
  userId: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  rating: number;
  comment: string;
  isApproved: boolean;
  isSelect: boolean;
  createdAt: string;
}