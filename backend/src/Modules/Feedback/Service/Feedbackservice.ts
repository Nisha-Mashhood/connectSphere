import { BaseService } from '../../../core/Services/BaseService';
import { ServiceError } from '../../../core/Utils/ErrorHandler';
import logger from '../../../core/Utils/Logger';
import { FeedbackRepository } from '../Repositry/FeedBackRepositry';
import { CollaborationRepository } from '../../Collaboration/Repositry/CollaborationRepositry';
import { IFeedback } from '../../../Interfaces/models/IFeedback';

export class FeedbackService extends BaseService {
  private feedbackRepo: FeedbackRepository;
  private collabRepo: CollaborationRepository;

  constructor() {
    super();
    this.feedbackRepo = new FeedbackRepository();
    this.collabRepo = new CollaborationRepository();
  }

   createFeedback = async(feedbackData: Partial<IFeedback>): Promise<IFeedback> => {
    try {
      logger.debug(`Creating feedback for collaboration: ${feedbackData.collaborationId}`);
      this.checkData(feedbackData);

      const collabId = feedbackData.collaborationId?.toString();
      if (!collabId) {
        logger.error('Collaboration ID is required');
        throw new ServiceError('Collaboration ID is required');
      }

      const collabDetails = await this.collabRepo.findById(collabId);
      if (!collabDetails) {
        logger.error(`Collaboration not found: ${collabId}`);
        throw new ServiceError('Collaboration not found');
      }

      const today = new Date();
      if (collabDetails.endDate && new Date(collabDetails.endDate) <= today) {
        logger.debug(`Updating collaboration feedback status: ${collabId}`);
        await this.collabRepo.updateCollabFeedback(collabId);
      }

      return await this.feedbackRepo.createFeedback(feedbackData);
    } catch (error: any) {
      logger.error(`Error creating feedback: ${error.message}`);
      throw new ServiceError(`Error creating feedback: ${error.message}`);
    }
  }

   getMentorFeedbacks = async(mentorId: string): Promise<{ feedbacks: IFeedback[]; averageRating: number; totalFeedbacks: number }> => {
    try {
      logger.debug(`Fetching feedbacks for mentor: ${mentorId}`);
      this.checkData(mentorId);

      const feedbacks = await this.feedbackRepo.getFeedbacksByMentorId(mentorId);
      const averageRating = await this.feedbackRepo.getMentorAverageRating(mentorId);

      return {
        feedbacks,
        averageRating,
        totalFeedbacks: feedbacks.length,
      };
    } catch (error: any) {
      logger.error(`Error fetching mentor feedbacks: ${error.message}`);
      throw new ServiceError(`Error fetching mentor feedbacks: ${error.message}`);
    }
  }

   getUserFeedbacks = async(userId: string): Promise<IFeedback[]> => {
    try {
      logger.debug(`Fetching feedbacks for user: ${userId}`);
      this.checkData(userId);
      return await this.feedbackRepo.getFeedbacksByUserId(userId);
    } catch (error: any) {
      logger.error(`Error fetching user feedbacks: ${error.message}`);
      throw new ServiceError(`Error fetching user feedbacks: ${error.message}`);
    }
  }

   getFeedbackForProfile = async(profileId: string, profileType: 'mentor' | 'user'): Promise<{ feedbacks: IFeedback[]; totalFeedbacks: number }>=> {
    try {
      logger.debug(`Fetching feedbacks for profile: ${profileId}, type: ${profileType}`);
      this.checkData({ profileId, profileType });

      if (!['mentor', 'user'].includes(profileType)) {
        logger.error(`Invalid profile type: ${profileType}`);
        throw new ServiceError('Invalid profile type');
      }

      const feedbacks = await this.feedbackRepo.getFeedbackForProfile(profileId, profileType);
      return {
        feedbacks,
        totalFeedbacks: feedbacks.length,
      };
    } catch (error: any) {
      logger.error(`Error fetching feedbacks for profile: ${error.message}`);
      throw new ServiceError(`Error fetching feedbacks for profile: ${error.message}`);
    }
  }

   getFeedbackByCollaborationId = async(collabId: string): Promise<IFeedback[]> => {
    try {
      logger.debug(`Fetching feedbacks for collaboration: ${collabId}`);
      this.checkData(collabId);
      return await this.feedbackRepo.getFeedbackByCollaborationId(collabId);
    } catch (error: any) {
      logger.error(`Error fetching feedbacks by collaboration ID: ${error.message}`);
      throw new ServiceError(`Error fetching feedbacks by collaboration ID: ${error.message}`);
    }
  }

   toggleFeedback = async(feedbackId: string): Promise<IFeedback> => {
    try {
      logger.debug(`Toggling feedback visibility: ${feedbackId}`);
      this.checkData(feedbackId);
      return await this.feedbackRepo.toggleIsHidden(feedbackId);
    } catch (error: any) {
      logger.error(`Error toggling feedback visibility: ${error.message}`);
      throw new ServiceError(`Error toggling feedback visibility: ${error.message}`);
    }
  }

   getFeedbackByMentorId = async(mentorId: string): Promise<IFeedback[]> => {
    try {
      logger.debug(`Fetching feedbacks by mentor ID: ${mentorId}`);
      this.checkData(mentorId);
      return await this.feedbackRepo.getFeedbacksByMentorId(mentorId);
    } catch (error: any) {
      logger.error(`Error fetching feedbacks by mentor ID: ${error.message}`);
      throw new ServiceError(`Error fetching feedbacks by mentor ID: ${error.message}`);
    }
  }
}