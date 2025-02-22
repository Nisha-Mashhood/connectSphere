import * as FeedbackRepository from "../repositories/feeback.repositry.js";
export const createFeedback = async (feedbackData) => {
    try {
        // Check if feedback already exists for this collaboration
        const existingFeedback = await FeedbackRepository.getFeedbackByCollaborationId(feedbackData.collaborationId.toString());
        if (existingFeedback) {
            throw new Error("Feedback already exists for this collaboration");
        }
        return await FeedbackRepository.createFeedback(feedbackData);
    }
    catch (error) {
        throw error;
    }
};
export const getMentorFeedbacks = async (mentorId) => {
    try {
        const feedbacks = await FeedbackRepository.getFeedbacksByMentorId(mentorId);
        const averageRating = await FeedbackRepository.getMentorAverageRating(mentorId);
        return {
            feedbacks,
            averageRating,
            totalFeedbacks: feedbacks.length,
        };
    }
    catch (error) {
        throw error;
    }
};
export const getUserFeedbacks = async (userId) => {
    try {
        return await FeedbackRepository.getFeedbacksByUserId(userId);
    }
    catch (error) {
        throw error;
    }
};
//# sourceMappingURL=feedback.service.js.map