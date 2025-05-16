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
export const getFeedbackForProfile = async (profileId, profileType) => {
    try {
        const feedbacks = await FeedbackRepository.getFeedbackForProfile(profileId, profileType);
        return {
            feedbacks,
            totalFeedbacks: feedbacks.length,
        };
    }
    catch (error) {
        throw error;
    }
};
export const getFeedbackByCollaborationId = async (collabId) => {
    try {
        if (!collabId) {
            throw new Error("Collaboration ID is required");
        }
        const feedback = await FeedbackRepository.getFeedbackByCollaborationId(collabId);
        return feedback;
    }
    catch (error) {
        throw error;
    }
};
export const toggleFeedbackservice = async (feedbackId) => {
    try {
        if (!feedbackId) {
            throw new Error("feedbackId required");
        }
        const feedback = await FeedbackRepository.toggleisHidden(feedbackId);
        return feedback;
    }
    catch (error) {
        throw error;
    }
};
export const getFeedBackByMentorIdService = async (mentorId) => {
    try {
        if (!mentorId) {
            throw new Error("Mentor ID is required");
        }
        const feedback = await FeedbackRepository.getFeedbacksByMentorId(mentorId);
        return feedback;
    }
    catch (error) {
        throw error;
    }
};
//# sourceMappingURL=feedback.service.js.map