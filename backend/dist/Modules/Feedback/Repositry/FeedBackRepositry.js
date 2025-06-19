import { Types } from 'mongoose';
import { BaseRepository } from '../../../core/Repositries/BaseRepositry.js';
import { RepositoryError } from '../../../core/Utils/ErrorHandler.js';
import logger from '../../../core/Utils/Logger.js';
import Feedback from '../../../models/feedback.modal.js';
export class FeedbackRepository extends BaseRepository {
    constructor() {
        super(Feedback);
    }
    toObjectId(id) {
        if (!id) {
            logger.error('Missing ID');
            throw new RepositoryError('Invalid ID: ID is required');
        }
        const idStr = typeof id === 'string' ? id : id.toString();
        if (!Types.ObjectId.isValid(idStr)) {
            logger.error(`Invalid ID: ${idStr}`);
            throw new RepositoryError('Invalid ID: must be a 24 character hex string');
        }
        return new Types.ObjectId(idStr);
    }
    async createFeedback(feedbackData) {
        try {
            logger.debug(`Creating feedback for collaboration: ${feedbackData.collaborationId}`);
            return await this.create({
                ...feedbackData,
                userId: feedbackData.userId ? this.toObjectId(feedbackData.userId) : undefined,
                mentorId: feedbackData.mentorId ? this.toObjectId(feedbackData.mentorId) : undefined,
                collaborationId: feedbackData.collaborationId ? this.toObjectId(feedbackData.collaborationId) : undefined,
                createdAt: new Date(),
            });
        }
        catch (error) {
            logger.error(`Error creating feedback: ${error.message}`);
            throw new RepositoryError(`Error creating feedback: ${error.message}`);
        }
    }
    async getFeedbacksByMentorId(mentorId) {
        try {
            logger.debug(`Fetching feedbacks for mentor: ${mentorId}`);
            return await this.model
                .find({ mentorId: this.toObjectId(mentorId) })
                .populate('userId', 'name email profilePic')
                .sort({ createdAt: -1 })
                .exec();
        }
        catch (error) {
            logger.error(`Error fetching feedbacks by mentor ID: ${error.message}`);
            throw new RepositoryError(`Error fetching feedbacks by mentor ID: ${error.message}`);
        }
    }
    async getFeedbacksByUserId(userId) {
        try {
            logger.debug(`Fetching feedbacks for user: ${userId}`);
            return await this.model
                .find({ userId: this.toObjectId(userId) })
                .populate('mentorId', 'name profilePic')
                .sort({ createdAt: -1 })
                .limit(10)
                .exec();
        }
        catch (error) {
            logger.error(`Error fetching feedbacks by user ID: ${error.message}`);
            throw new RepositoryError(`Error fetching feedbacks by user ID: ${error.message}`);
        }
    }
    async getFeedbackByCollaborationId(collaborationId) {
        try {
            logger.debug(`Fetching feedbacks for collaboration: ${collaborationId}`);
            return await this.model
                .find({ collaborationId: this.toObjectId(collaborationId) })
                .populate('mentorId', 'name email profilePic')
                .populate('userId', 'name email profilePic')
                .exec();
        }
        catch (error) {
            logger.error(`Error fetching feedbacks by collaboration ID: ${error.message}`);
            throw new RepositoryError(`Error fetching feedbacks by collaboration ID: ${error.message}`);
        }
    }
    async getMentorAverageRating(mentorId) {
        try {
            logger.debug(`Calculating average rating for mentor: ${mentorId}`);
            const result = await this.model.aggregate([
                { $match: { mentorId: this.toObjectId(mentorId) } },
                {
                    $group: {
                        _id: null,
                        averageRating: { $avg: '$rating' },
                        averageCommunication: { $avg: '$communication' },
                        averageExpertise: { $avg: '$expertise' },
                        averagePunctuality: { $avg: '$punctuality' },
                    },
                },
            ]);
            return result[0]?.averageRating || 0;
        }
        catch (error) {
            logger.error(`Error calculating mentor average rating: ${error.message}`);
            throw new RepositoryError(`Error calculating mentor average rating: ${error.message}`);
        }
    }
    async getFeedbackForProfile(profileId, profileType) {
        try {
            logger.debug(`Fetching feedbacks for profile: ${profileId}, type: ${profileType}`);
            const query = profileType === 'mentor'
                ? { mentorId: this.toObjectId(profileId), isHidden: false }
                : { userId: this.toObjectId(profileId), isHidden: false };
            return await this.model
                .find(query)
                .populate('userId', 'name email profilePic')
                .populate({
                path: 'mentorId',
                populate: {
                    path: 'userId',
                    select: 'name email profilePic',
                },
            })
                .sort({ createdAt: -1 })
                .limit(5)
                .exec();
        }
        catch (error) {
            logger.error(`Error fetching feedbacks for profile: ${error.message}`);
            throw new RepositoryError(`Error fetching feedbacks for profile: ${error.message}`);
        }
    }
    async toggleIsHidden(feedbackId) {
        try {
            logger.debug(`Toggling isHidden for feedback: ${feedbackId}`);
            const feedback = await this.findById(feedbackId);
            if (!feedback) {
                logger.error(`Feedback not found: ${feedbackId}`);
                throw new RepositoryError(`Feedback with ID ${feedbackId} not found`);
            }
            feedback.isHidden = !feedback.isHidden;
            return await feedback.save();
        }
        catch (error) {
            logger.error(`Error toggling isHidden for feedback: ${error.message}`);
            throw new RepositoryError(`Error toggling isHidden for feedback: ${error.message}`);
        }
    }
}
//# sourceMappingURL=FeedBackRepositry.js.map