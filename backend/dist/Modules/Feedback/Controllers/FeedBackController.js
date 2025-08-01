import { FeedbackService } from '../Service/Feedbackservice.js';
import logger from '../../../core/Utils/Logger.js';
export class FeedbackController {
    feedbackService;
    constructor() {
        this.feedbackService = new FeedbackService();
    }
    createFeedback = async (req, res) => {
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
            logger.debug(`Creating feedback for collaboration: ${feedbackData.collaborationId}`);
            if (!feedbackData.userId || !feedbackData.mentorId || !feedbackData.collaborationId || !feedbackData.rating) {
                logger.error('Missing required fields');
                throw new Error('Missing required fields: userId, mentorId, collaborationId, or rating');
            }
            const feedback = await this.feedbackService.createFeedback(feedbackData);
            res.status(201).json({
                success: true,
                message: 'Feedback created successfully',
                data: feedback,
            });
        }
        catch (error) {
            logger.error(`Error creating feedback: ${error.message}`);
            res.status(400).json({
                success: false,
                message: error.message || 'Error creating feedback',
            });
        }
    };
    getMentorFeedbacks = async (req, res) => {
        try {
            const { mentorId } = req.params;
            logger.debug(`Fetching feedbacks for mentor: ${mentorId}`);
            const feedbackData = await this.feedbackService.getMentorFeedbacks(mentorId);
            res.status(200).json({
                success: true,
                message: 'Mentor feedbacks fetched successfully',
                data: feedbackData,
            });
        }
        catch (error) {
            logger.error(`Error fetching mentor feedbacks: ${error.message}`);
            res.status(400).json({
                success: false,
                message: error.message || 'Error fetching mentor feedbacks',
            });
        }
    };
    getUserFeedbacks = async (req, res) => {
        try {
            const { userId } = req.params;
            logger.debug(`Fetching feedbacks for user: ${userId}`);
            const feedbacks = await this.feedbackService.getUserFeedbacks(userId);
            res.status(200).json({
                success: true,
                message: 'User feedbacks fetched successfully',
                data: feedbacks,
            });
        }
        catch (error) {
            logger.error(`Error fetching user feedbacks: ${error.message}`);
            res.status(400).json({
                success: false,
                message: error.message || 'Error fetching user feedbacks',
            });
        }
    };
    getFeedbackForProfile = async (req, res) => {
        try {
            const { profileId, profileType } = req.params;
            logger.debug(`Fetching feedbacks for profile: ${profileId}, type: ${profileType}`);
            if (!['mentor', 'user'].includes(profileType)) {
                logger.error(`Invalid profile type: ${profileType}`);
                throw new Error('Invalid profile type');
            }
            const feedbackData = await this.feedbackService.getFeedbackForProfile(profileId, profileType);
            res.status(200).json({
                success: true,
                message: 'Profile feedbacks fetched successfully',
                data: feedbackData,
            });
        }
        catch (error) {
            logger.error(`Error fetching profile feedbacks: ${error.message}`);
            res.status(400).json({
                success: false,
                message: error.message || 'Error fetching profile feedbacks',
            });
        }
    };
    getFeedbackByCollaborationId = async (req, res) => {
        try {
            const { collabId } = req.params;
            logger.debug(`Fetching feedbacks for collaboration: ${collabId}`);
            const feedbacks = await this.feedbackService.getFeedbackByCollaborationId(collabId);
            res.status(200).json({
                success: true,
                message: 'Collaboration feedbacks fetched successfully',
                data: feedbacks,
            });
        }
        catch (error) {
            logger.error(`Error fetching collaboration feedbacks: ${error.message}`);
            res.status(400).json({
                success: false,
                message: error.message || 'Error fetching collaboration feedbacks',
            });
        }
    };
    toggleFeedback = async (req, res) => {
        try {
            const { feedbackId } = req.params;
            logger.debug(`Toggling feedback visibility: ${feedbackId}`);
            const feedback = await this.feedbackService.toggleFeedback(feedbackId);
            res.status(200).json({
                success: true,
                message: `Feedback visibility toggled to ${feedback.isHidden ? 'hidden' : 'visible'}`,
                data: feedback,
            });
        }
        catch (error) {
            logger.error(`Error toggling feedback visibility: ${error.message}`);
            res.status(400).json({
                success: false,
                message: error.message || 'Error toggling feedback visibility',
            });
        }
    };
    getFeedbackByMentorId = async (req, res) => {
        try {
            const { mentorId } = req.params;
            logger.debug(`Fetching feedbacks by mentor ID: ${mentorId}`);
            const feedbacks = await this.feedbackService.getFeedbackByMentorId(mentorId);
            res.status(200).json({
                success: true,
                message: 'Feedbacks fetched successfully',
                data: feedbacks,
            });
        }
        catch (error) {
            logger.error(`Error fetching feedbacks by mentor ID: ${error.message}`);
            res.status(400).json({
                success: false,
                message: error.message || 'Error fetching feedbacks by mentor ID',
            });
        }
    };
}
//# sourceMappingURL=FeedBackController.js.map