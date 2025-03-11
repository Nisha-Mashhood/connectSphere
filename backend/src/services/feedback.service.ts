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

export const getFeedbackByRole = async(role: "user" | "mentor", userId: string, collaborationId: string) =>{
  if (!role || !userId || !collaborationId) {
    throw new Error("Invalid request parameters.");
  }

  // Retrieve all feedbacks for the given collaboration ID
  const feedbacks: IFeedback[] = await FeedbackRepository.getFeedbackByCollaborationId(collaborationId);

  if (!feedbacks.length) {
    throw new Error("No feedback found for this collaboration.");
  }

  // Filter feedback based on the provided role and userId
  const filteredFeedback = feedbacks.find(feedback => {
    if (feedback.givenBy === role) {
      if (role === "user" && feedback.userId.toString() === userId) {
        return true;
      }
      if (role === "mentor" && feedback.mentorId.toString() === userId) {
        return true;
      }
    }
    return false;
  });

  if (!filteredFeedback) {
    throw new Error("Feedback not found or does not match the given role and user ID.");
  }

  return filteredFeedback;
}