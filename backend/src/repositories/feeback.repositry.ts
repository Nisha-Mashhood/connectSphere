import Feedback, { IFeedback } from "../models/feedback.modal.js";
import mongoose from "mongoose";

export const createFeedback = async (
  feedbackData: Partial<IFeedback>
): Promise<IFeedback> => {
  const feedback = new Feedback(feedbackData);
  return await feedback.save();
};

export const getFeedbacksByMentorId = async (
  mentorId: string
): Promise<IFeedback[]> => {
  return await Feedback.find({
    mentorId: new mongoose.Types.ObjectId(mentorId),
  })
    .populate("userId", "name profilePic")
    .sort({ createdAt: -1 });
};

export const getFeedbacksByUserId = async (
  userId: string
): Promise<IFeedback[]> => {
  return await Feedback.find({ userId: new mongoose.Types.ObjectId(userId) })
    .populate("mentorId", "name profilePic")
    .sort({ createdAt: -1 });
};

export const getFeedbackByCollaborationId = async (collaborationId: string) => {
  const feedback = await Feedback.find({
    collaborationId: new mongoose.Types.ObjectId(collaborationId),
  })
  .populate("mentorId")
  .populate("userId")

   return feedback;
};

export const getMentorAverageRating = async (
  mentorId: string
): Promise<number> => {
  const result = await Feedback.aggregate([
    { $match: { mentorId: new mongoose.Types.ObjectId(mentorId) } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: "$rating" },
        averageCommunication: { $avg: "$communication" },
        averageExpertise: { $avg: "$expertise" },
        averagePunctuality: { $avg: "$punctuality" },
      },
    },
  ]);
  return result[0]?.averageRating || 0;
};
