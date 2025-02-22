import { IFeedback } from "../models/feedback.modal.js";
import * as FeedbackRepository from "../repositories/feeback.repositry.js";

export const createFeedback = async (
  feedbackData: Partial<IFeedback>
): Promise<IFeedback> => {
  try {
    // Check if feedback already exists for this collaboration
    const existingFeedback =
      await FeedbackRepository.getFeedbackByCollaborationId(
        feedbackData.collaborationId!.toString()
      );

    if (existingFeedback) {
      throw new Error("Feedback already exists for this collaboration");
    }

    return await FeedbackRepository.createFeedback(feedbackData);
  } catch (error) {
    throw error;
  }
};

export const getMentorFeedbacks = async (mentorId: string) => {
  try {
    const feedbacks = await FeedbackRepository.getFeedbacksByMentorId(mentorId);
    const averageRating = await FeedbackRepository.getMentorAverageRating(
      mentorId
    );

    return {
      feedbacks,
      averageRating,
      totalFeedbacks: feedbacks.length,
    };
  } catch (error) {
    throw error;
  }
};

export const getUserFeedbacks = async (userId: string) => {
  try {
    return await FeedbackRepository.getFeedbacksByUserId(userId);
  } catch (error) {
    throw error;
  }
};
