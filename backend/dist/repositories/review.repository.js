import Review from '../models/Review.modal.js';
export const createReview = async (data) => {
    try {
        const review = new Review(data);
        return await review.save();
    }
    catch (error) {
        console.log(`[Review Repository] Failed to create review document: ${error}`);
        return null;
    }
};
export const findById = async (reviewId) => {
    try {
        return await Review.findOne({ reviewId }).populate('userId', 'email username');
    }
    catch (error) {
        console.log(`[Review Repository] Failed to find review: ${error}`);
        return null;
    }
};
export const getAllReviews = async () => {
    try {
        return await Review.find().populate('userId', 'email username').sort({ createdAt: -1 });
    }
    catch (error) {
        console.log(`[Review Repository] Failed to fetch reviews: ${error}`);
        return null;
    }
};
export const updateReview = async (reviewId, updates) => {
    try {
        const review = await Review.findOneAndUpdate({ reviewId }, updates, { new: true }).populate('userId', 'email username');
        if (!review) {
            console.log(`[Review Repository] Review not found`);
            return null;
        }
        return review;
    }
    catch (error) {
        console.log(`[Review Repository] Failed to update review: ${error}`);
        return null;
    }
};
export const getSelectedReviews = async () => {
    try {
        return await Review.find({ isSelect: true, isApproved: true }).populate('userId');
    }
    catch (error) {
        console.log(`[Review Repository] Failed to fetch selected reviews: ${error}`);
        return null;
    }
};
//# sourceMappingURL=review.repository.js.map