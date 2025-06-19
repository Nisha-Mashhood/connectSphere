import * as ReviewService from "../services/review.service.js";
export const submitReview = async (req, res) => {
    try {
        const { userId, rating, comment } = req.body;
        if (!userId || !rating || !comment) {
            console.log("Missing required fields");
        }
        const review = await ReviewService.submitReview(userId, rating, comment);
        res.status(201).json({ success: true, data: review });
    }
    catch (error) {
        res
            .status(error.status || 500)
            .json({ success: false, message: error.message });
    }
};
export const skipReview = async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) {
            console.log("Missing userId");
        }
        await ReviewService.skipReview(userId);
        res.status(200).json({ success: true, message: "Review skipped" });
    }
    catch (error) {
        res
            .status(error.status || 500)
            .json({ success: false, message: error.message });
    }
};
export const getAllReviews = async (_req, res) => {
    try {
        const reviews = await ReviewService.getAllReviews();
        res.status(200).json({ success: true, data: reviews });
    }
    catch (error) {
        res
            .status(error.status || 500)
            .json({ success: false, message: error.message });
    }
};
export const approveReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const review = await ReviewService.approveReview(reviewId);
        res.status(200).json({ success: true, data: review });
    }
    catch (error) {
        res
            .status(error.status || 500)
            .json({ success: false, message: error.message });
    }
};
export const selectReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const review = await ReviewService.selectReview(reviewId);
        res.status(200).json({ success: true, data: review });
    }
    catch (error) {
        res
            .status(error.status || 500)
            .json({ success: false, message: error.message });
    }
};
export const getSelectedReviews = async (_req, res) => {
    try {
        const reviews = await ReviewService.getSelectedReviews();
        res.status(200).json({ success: true, data: reviews });
    }
    catch (error) {
        res
            .status(error.status || 500)
            .json({ success: false, message: error.message });
    }
};
export const cancelApproval = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const review = await ReviewService.cancelApproval(reviewId);
        res.status(200).json({ success: true, data: review });
    }
    catch (error) {
        res
            .status(error.status || 500)
            .json({ success: false, message: error.message });
    }
};
export const deselectReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const review = await ReviewService.deselectReview(reviewId);
        res.status(200).json({ success: true, data: review });
    }
    catch (error) {
        res
            .status(error.status || 500)
            .json({ success: false, message: error.message });
    }
};
//# sourceMappingURL=review.controller.js.map