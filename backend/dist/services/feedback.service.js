import { findCollabById, updateCollabFeedback } from "../repositories/collaboration.repositry.js";
import * as FeedbackRepository from "../repositories/feeback.repositry.js";
export const createFeedback = async (feedbackData) => {
    try {
        // Ensure collaborationId is valid
        const collabId = feedbackData.collaborationId?.toString();
        if (!collabId) {
            throw new Error("Collaboration ID is required");
        }
        // Find the collaboration details
        const collabDetails = await findCollabById(collabId);
        if (!collabDetails) {
            throw new Error("Collaboration not found");
        }
        // Check if the collaboration is completed
        const today = new Date();
        if (collabDetails.endDate && new Date(collabDetails.endDate) <= today) {
            await updateCollabFeedback(collabId);
        }
        // Create feedback entry
        return await FeedbackRepository.createFeedback(feedbackData);
    }
    catch (error) {
        console.log(error);
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