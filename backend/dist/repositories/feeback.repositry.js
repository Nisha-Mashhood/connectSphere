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
        .populate("userId")
        .sort({ createdAt: -1 });
};
export const getFeedbacksByUserId = async (userId) => {
    return await Feedback.find({ userId: new mongoose.Types.ObjectId(userId) })
        .populate("mentorId", "name profilePic")
        .sort({ createdAt: -1 })
        .limit(10);
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
export const getFeedbackForProfile = async (profileId, profileType) => {
    const query = profileType === "mentor"
        ? { mentorId: new mongoose.Types.ObjectId(profileId), isHidden: false }
        : { userId: new mongoose.Types.ObjectId(profileId), isHidden: false };
    const feedBack = await Feedback.find(query)
        .populate("userId", "name profilePic") // Populate user details
        .populate({
        path: "mentorId",
        populate: {
            path: "userId",
            select: "name email profilePic",
        },
    })
        .sort({ createdAt: -1 })
        .limit(5);
    // console.log(`feedback from repositry : ${feedBack}`);
    return feedBack;
};
export const toggleisHidden = async (feedbackId) => {
    // console.log(`Toggling isHidden for feedbackId: ${feedbackId}`);
    const feedback = await Feedback.findById(feedbackId);
    if (!feedback) {
        throw new Error(`Feedback with feedbackId ${feedbackId} not found`);
    }
    feedback.isHidden = !feedback.isHidden;
    await feedback.save();
    // console.log(`Feedback isHidden updated to: ${feedback.isHidden}`);
    return feedback;
};
//# sourceMappingURL=feeback.repositry.js.map