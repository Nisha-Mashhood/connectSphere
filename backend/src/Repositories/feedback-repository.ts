import { injectable } from 'inversify';
import { Model, Types } from 'mongoose';
import { BaseRepository } from '../core/repositries/base-repositry';
import { RepositoryError } from '../core/utils/error-handler';
import logger from '../core/utils/logger';
import Feedback from '../Models/feedback-model';
import { IFeedback } from '../Interfaces/Models/i-feedback';
import { StatusCodes } from '../enums/status-code-enums';
import { IFeedbackRepository } from '../Interfaces/Repository/i-feedback-repositry';

@injectable()
export class FeedbackRepository extends BaseRepository<IFeedback> implements IFeedbackRepository{
  constructor() {
    super(Feedback as Model<IFeedback>);
  }

  private toObjectId = (id?: string | Types.ObjectId): Types.ObjectId => {
    if (!id) {
      logger.warn('Missing ID when converting to ObjectId');
      throw new RepositoryError('Invalid ID: ID is required', StatusCodes.BAD_REQUEST);
    }
    const idStr = typeof id === 'string' ? id : id.toString();
    if (!Types.ObjectId.isValid(idStr)) {
      logger.warn(`Invalid ObjectId format: ${idStr}`);
      throw new RepositoryError('Invalid ID: must be a 24 character hex string', StatusCodes.BAD_REQUEST);
    }
    return new Types.ObjectId(idStr);
  }

   public createFeedback = async (feedbackData: Partial<IFeedback>): Promise<IFeedback> => {
    try {
      logger.debug(`Creating feedback for collaboration: ${feedbackData.collaborationId}`);
      const feedback = await this.create({
        ...feedbackData,
        userId: feedbackData.userId ? this.toObjectId(feedbackData.userId) : undefined,
        mentorId: feedbackData.mentorId ? this.toObjectId(feedbackData.mentorId) : undefined,
        collaborationId: feedbackData.collaborationId ? this.toObjectId(feedbackData.collaborationId) : undefined,
        createdAt: new Date(),
      });
      logger.info(`Feedback created: ${feedback._id}`);
      return feedback;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error creating feedback for collaboration ${feedbackData.collaborationId}`, err);
      throw new RepositoryError('Error creating feedback', StatusCodes.INTERNAL_SERVER_ERROR, err);
    }
  }
  
  public getFeedbacksByMentorId = async (mentorId: string): Promise<IFeedback[]> => {
    try {
      logger.debug(`Fetching feedbacks for mentor: ${mentorId}`);
      const feedbacks = await this.model
        .find({ mentorId: this.toObjectId(mentorId) })
        .populate('userId', '_id name email profilePic')
        .sort({ createdAt: -1 })
        .exec();
      logger.info(`Fetched ${feedbacks.length} feedbacks for mentorId: ${mentorId}`);
      return feedbacks;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error fetching feedbacks for mentorId ${mentorId}`, err);
      throw new RepositoryError('Error fetching feedbacks by mentor ID', StatusCodes.INTERNAL_SERVER_ERROR, err);
    }
  }

  public getFeedbacksByUserId = async (userId: string): Promise<IFeedback[]> => {
    try {
      logger.debug(`Fetching feedbacks for user: ${userId}`);
      const feedbacks = await this.model
        .find({ userId: this.toObjectId(userId) })
        .populate('mentorId', '_id name profilePic')
        .sort({ createdAt: -1 })
        .limit(10)
        .exec();
      logger.info(`Fetched ${feedbacks.length} feedbacks for userId: ${userId}`);
      return feedbacks;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error fetching feedbacks for userId ${userId}`, err);
      throw new RepositoryError('Error fetching feedbacks by user ID', StatusCodes.INTERNAL_SERVER_ERROR, err);
    }
  }

  public getFeedbackByCollaborationId = async (collaborationId: string): Promise<IFeedback[]> => {
    try {
      logger.debug(`Fetching feedbacks for collaboration: ${collaborationId}`);
      const feedbacks = await this.model
        .find({ collaborationId: this.toObjectId(collaborationId) })
        .populate('mentorId', '_id name email profilePic')
        .populate('userId', '_id name email profilePic')
        .exec();
      logger.info(`Fetched ${feedbacks.length} feedbacks for collaborationId: ${collaborationId}`);
      return feedbacks;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error fetching feedbacks for collaborationId ${collaborationId}`, err);
      throw new RepositoryError('Error fetching feedbacks by collaboration ID', StatusCodes.INTERNAL_SERVER_ERROR, err);
    }
  }

  public getMentorAverageRating = async (mentorId: string): Promise<number> => {
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
      const averageRating = result[0]?.averageRating || 0;
      logger.info(`Calculated average rating for mentorId ${mentorId}: ${averageRating}`);
      return averageRating;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error calculating average rating for mentorId ${mentorId}`, err);
      throw new RepositoryError('Error calculating mentor average rating', StatusCodes.INTERNAL_SERVER_ERROR, err);
    }
  }

  public getFeedbackForProfile = async (profileId: string, profileType: 'mentor' | 'user'): Promise<IFeedback[]> => {
    try {
      logger.debug(`Fetching feedbacks for profile: ${profileId}, type: ${profileType}`);
      const query: Record<string, any> =
        profileType === 'mentor'
          ? { mentorId: this.toObjectId(profileId), isHidden: false }
          : { userId: this.toObjectId(profileId), isHidden: false };

      const feedbacks = await this.model
        .find(query)
        .populate('userId', '_id name email profilePic')
        .populate({
          path: 'mentorId',
          populate: {
            path: 'userId',
            select: '_id name email profilePic',
          },
        })
        .sort({ createdAt: -1 })
        .limit(5)
        .exec();
      logger.info(`Fetched ${feedbacks.length} feedbacks for profileId: ${profileId}, type: ${profileType}`);
      return feedbacks;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error fetching feedbacks for profileId ${profileId}, type ${profileType}`, err);
      throw new RepositoryError('Error fetching feedbacks for profile', StatusCodes.INTERNAL_SERVER_ERROR, err);
    }
  }

  public toggleIsHidden = async (feedbackId: string): Promise<IFeedback | null> => {
    try {
      logger.debug(`Toggling isHidden for feedback: ${feedbackId}`);
      const feedback = await this.findById(feedbackId);
      if (!feedback) {
        logger.warn(`Feedback not found: ${feedbackId}`);
        throw new RepositoryError(`Feedback not found with ID: ${feedbackId}`, StatusCodes.NOT_FOUND);
      }
      feedback.isHidden = !feedback.isHidden;
      const updatedFeedback = await feedback.save();
      logger.info(`isHidden toggled for feedback: ${feedbackId}, new status: ${updatedFeedback.isHidden}`);
      return updatedFeedback;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error toggling isHidden for feedback ${feedbackId}`, err);
      throw new RepositoryError('Error toggling isHidden for feedback', StatusCodes.INTERNAL_SERVER_ERROR, err);
    }
  }
}