import Review, { IReview } from '../models/Review.modal.js';


export const createReview = async (data: { userId: string; rating: number; comment: string }): Promise<IReview | null> => {
  try {
    const review = new Review(data);
    return await review.save();
  } catch (error) {
    console.log(`[Review Repository] Failed to create review document: ${error}`);
    return null;
  }
};

export const findById = async (reviewId: string): Promise<IReview | null> => {
  try {
    return await Review.findOne({ reviewId }).populate('userId', 'email username');
  } catch (error) {
    console.log(`[Review Repository] Failed to find review: ${error}`);
    return null;
  }
};

export const getAllReviews = async (): Promise<IReview[] | null> => {
  try {
    return await Review.find().populate('userId', 'email username').sort({ createdAt: -1 });
  } catch (error) {
    console.log(`[Review Repository] Failed to fetch reviews: ${error}`);
    return null;
  }
};

export const updateReview = async (reviewId: string, updates: { isApproved?: boolean; isSelect?: boolean }): Promise<IReview | null> => {
  try {
    const review = await Review.findOneAndUpdate({ reviewId }, updates, { new: true }).populate('userId', 'email username');
    if (!review) {
      console.log(`[Review Repository] Review not found`);
      return null;
    }
    return review;
  } catch (error) {
    console.log(`[Review Repository] Failed to update review: ${error}`);
    return null;
  }
};

export const getSelectedReviews = async (): Promise<IReview[] | null> => {
  try {
    return await Review.find({ isSelect: true, isApproved: true }).populate('userId');
  } catch (error) {
    console.log(`[Review Repository] Failed to fetch selected reviews: ${error}`);
    return null;
  }
};