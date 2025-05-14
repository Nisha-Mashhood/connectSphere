import * as FeedbackService from "../services/feedback.service.js";
export const createFeedback = async (req, res) => {
    try {
        const feedbackData = {
            userId: req.body.userId,
            mentorId: req.body.mentorId,
            collaborationId: req.body.collaborationId,
            rating: req.body.rating,
            communication: req.body.communication,
            expertise: req.body.expertise,
            punctuality: req.body.punctuality,
            comments: req.body.comments,
            wouldRecommend: req.body.wouldRecommend,
            givenBy: req.body.role,
        };
        const feedback = await FeedbackService.createFeedback(feedbackData);
        console.log(feedback);
        res.status(201).json({ success: true, data: feedback });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
export const getMentorFeedbacks = async (req, res) => {
    try {
        const { mentorId } = req.params;
        const feedbackData = await FeedbackService.getMentorFeedbacks(mentorId);
        res.status(200).json({ success: true, data: feedbackData });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
export const getUserFeedbacks = async (req, res) => {
    try {
        const { userId } = req.params;
        const feedbacks = await FeedbackService.getUserFeedbacks(userId);
        res.status(200).json({ success: true, data: feedbacks });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
export const getFeedbackForProfile = async (req, res) => {
    try {
        const { profileId, profileType } = req.params;
        console.log('profile Id :', profileId);
        console.log('Profile Type : ', profileType);
        if (!["mentor", "user"].includes(profileType)) {
            res.status(400).json({ success: false, message: "Invalid profile type" });
            return;
        }
        const feedbackData = await FeedbackService.getFeedbackForProfile(profileId, profileType);
        res.status(200).json({ success: true, data: feedbackData });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
//# sourceMappingURL=feeback.controller.js.map