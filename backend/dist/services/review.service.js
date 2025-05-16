import { findUserById, updateUser } from '../repositories/user.repositry.js';
import * as ReviewRepository from '../repositories/review.repository.js';
export const submitReview = async (userId, rating, comment) => {
    const user = await findUserById(userId);
    if (!user) {
        console.log('User not found');
        throw new Error('User not found');
    }
    if (user.hasReviewed) {
        console.log('User has already submitted a review');
        throw new Error('User has already submitted a review');
    }
    if (rating < 1 || rating > 5) {
        console.log('Rating must be between 1 and 5');
        throw new Error('Rating must be between 1 and 5');
    }
    const review = await ReviewRepository.createReview({ userId, rating, comment });
    await updateUser(userId, { hasReviewed: true, loginCount: 0 });
    return review;
};
export const skipReview = async (userId) => {
    const user = await findUserById(userId);
    if (!user) {
        console.log('User not found');
        throw new Error('User not found');
    }
    await updateUser(userId, { loginCount: 0 });
};
export const getAllReviews = async () => {
    return await ReviewRepository.getAllReviews();
};
export const approveReview = async (reviewId) => {
    const review = await ReviewRepository.findById(reviewId);
    if (!review) {
        console.log('Review not found');
        throw new Error('Review not found');
    }
    return await ReviewRepository.updateReview(reviewId, { isApproved: true });
};
export const selectReview = async (reviewId) => {
    const review = await ReviewRepository.findById(reviewId);
    if (!review) {
        console.log('Review not found');
        throw new Error('Review not found');
    }
    if (!review?.isApproved) {
        console.log('Review must be approved before selecting');
        throw new Error('Review must be approved before selecting');
    }
    return await ReviewRepository.updateReview(reviewId, { isSelect: true });
};
export const cancelApproval = async (reviewId) => {
    const review = await ReviewRepository.findById(reviewId);
    if (!review) {
        console.log('Review not found');
        throw new Error('Review not found');
    }
    return await ReviewRepository.updateReview(reviewId, { isApproved: false, isSelect: false });
};
export const deselectReview = async (reviewId) => {
    const review = await ReviewRepository.findById(reviewId);
    if (!review) {
        console.log('Review not found');
        throw new Error('Review not found');
    }
    if (!review.isSelect) {
        console.log('Review not selected');
        throw new Error('Review not selected');
    }
    return await ReviewRepository.updateReview(reviewId, { isSelect: false });
};
export const getSelectedReviews = async () => {
    return await ReviewRepository.getSelectedReviews();
};
//# sourceMappingURL=review.service.js.map