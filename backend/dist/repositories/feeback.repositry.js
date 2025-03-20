import Feedback from "../models/feedback.modal.js";
import mongoose from "mongoose";
export const createFeedback = async (feedbackData) => {
    const feedback = new Feedback(feedbackData);
    return await feedback.save();
};
export const getFeedbacksByMentorId = async (mentorId) => {
    return await Feedback.find({
        mentorId: new mongoose.Types.ObjectId(mentorId),
    })
        .populate("userId", "name profilePic")
        .sort({ createdAt: -1 });
};
export const getFeedbacksByUserId = async (userId) => {
    return await Feedback.find({ userId: new mongoose.Types.ObjectId(userId) })
        .populate("mentorId", "name profilePic")
        .sort({ createdAt: -1 });
};
export const getFeedbackByCollaborationId = async (collaborationId) => {
    const feedback = await Feedback.find({
        collaborationId: new mongoose.Types.ObjectId(collaborationId),
    })
        .populate("mentorId")
        .populate("userId");
    return feedback;
};
export const getMentorAverageRating = async (mentorId) => {
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
//# sourceMappingURL=feeback.repositry.js.map