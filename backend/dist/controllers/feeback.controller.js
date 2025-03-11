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
export const getFeedbackOnRoles = async (req, res) => {
    try {
        const { role, userId, collabId } = req.body;
        // // Validate that role is either "user" or "mentor"
        // if (role !== "user" && role !== "mentor") {
        //   res.status(400).json({ 
        //     success: false, 
        //     message: "Role must be either 'user' or 'mentor'" 
        //   });
        //   return 
        // }
        // // Validate that required parameters are present
        // if (!userId || !collabId) {
        //   res.status(400).json({ 
        //     success: false, 
        //     message: "Missing required parameters: userId and collabId are required" 
        //   });
        //   return
        // }
        console.log("role:", role);
        console.log("userId : ", userId);
        console.log("CollabId :", collabId);
        // const feedback = await FeedbackService.getFeedbackByRole(role, userId, collabId);
        // res.status(200).json({ success: true, feedback });
        // return 
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
        return;
    }
};
//# sourceMappingURL=feeback.controller.js.map