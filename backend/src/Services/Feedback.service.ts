import { inject, injectable } from "inversify";
import { ServiceError } from '../Core/Utils/ErrorHandler';
import logger from '../Core/Utils/Logger';
import { IFeedback } from '../Interfaces/Models/IFeedback';
import { StatusCodes } from '../Enums/StatusCode.enums';
import { IFeedbackService } from '../Interfaces/Services/IFeedbackService';
import { IFeedbackRepository } from "../Interfaces/Repository/IFeedbackRepository";
import { ICollaborationRepository } from "../Interfaces/Repository/ICollaborationRepository";

@injectable()
export class FeedbackService implements IFeedbackService{
  private _feedbackRepository: IFeedbackRepository;
  private _collabRepository: ICollaborationRepository;

  constructor(
    @inject('IFeedbackRepository') feedbackRepository : IFeedbackRepository,
    @inject('ICollaborationRepository') collaborationrepository : ICollaborationRepository
  ) {
    this._feedbackRepository = feedbackRepository;
    this._collabRepository = collaborationrepository;
  }

   public createFeedback = async (feedbackData: Partial<IFeedback>): Promise<IFeedback> => {
    try {
      logger.debug(`Creating feedback for collaboration: ${feedbackData.collaborationId}`);

      const collabId = feedbackData.collaborationId?.toString();
      if (!collabId ) {
        logger.error(" missing collaboration ID");
        throw new ServiceError(
          "Collaboration ID is required",
          StatusCodes.BAD_REQUEST
        );
      }

      const collabDetails = await this._collabRepository.findById(collabId);
      if (!collabDetails) {
        logger.error(`Collaboration not found: ${collabId}`);
        throw new ServiceError("Collaboration not found", StatusCodes.NOT_FOUND);
      }

      const today = new Date();
      if (collabDetails.endDate && new Date(collabDetails.endDate) <= today) {
        logger.debug(`Updating collaboration feedback status: ${collabId}`);
        await this._collabRepository.updateCollabFeedback(collabId);
      }

      const feedback = await this._feedbackRepository.createFeedback(feedbackData);
      logger.info(`Feedback created: ${feedback._id}`);
      return feedback;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error creating feedback for collaboration ${feedbackData.collaborationId}: ${err.message}`);
      throw error instanceof ServiceError
        ? error
        : new ServiceError(
            "Failed to create feedback",
            StatusCodes.INTERNAL_SERVER_ERROR,
            err
          );
    }
  };

  public getMentorFeedbacks = async (
    mentorId: string
  ): Promise<{ feedbacks: IFeedback[]; averageRating: number; totalFeedbacks: number }> => {
    try {
      logger.debug(`Fetching feedbacks for mentor: ${mentorId}`);
      const feedbacks = await this._feedbackRepository.getFeedbacksByMentorId(mentorId);
      const averageRating = await this._feedbackRepository.getMentorAverageRating(mentorId);

      logger.info(`Fetched ${feedbacks.length} feedbacks for mentor: ${mentorId}`);
      return {
        feedbacks,
        averageRating,
        totalFeedbacks: feedbacks.length,
      };
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error fetching mentor feedbacks for mentor ${mentorId}: ${err.message}`);
      throw error instanceof ServiceError
        ? error
        : new ServiceError(
            "Failed to fetch mentor feedbacks",
            StatusCodes.INTERNAL_SERVER_ERROR,
            err
          );
    }
  };

  public getUserFeedbacks = async (userId: string): Promise<IFeedback[]> => {
    try {
      logger.debug(`Fetching feedbacks for user: ${userId}`);
      const feedbacks = await this._feedbackRepository.getFeedbacksByUserId(userId);
      logger.info(`Fetched ${feedbacks.length} feedbacks for user: ${userId}`);
      return feedbacks;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error fetching user feedbacks for user ${userId}: ${err.message}`);
      throw error instanceof ServiceError
        ? error
        : new ServiceError(
            "Failed to fetch user feedbacks",
            StatusCodes.INTERNAL_SERVER_ERROR,
            err
          );
    }
  };

  public getFeedbackForProfile = async (
    profileId: string,
    profileType: "mentor" | "user"
  ): Promise<{ feedbacks: IFeedback[]; totalFeedbacks: number }> => {
    try {
      logger.debug(`Fetching feedbacks for profile: ${profileId}, type: ${profileType}`);
      if (!["mentor", "user"].includes(profileType)) {
        logger.error(`Invalid profile type: ${profileType}`);
        throw new ServiceError("Invalid profile type", StatusCodes.BAD_REQUEST);
      }

      const feedbacks = await this._feedbackRepository.getFeedbackForProfile(profileId, profileType);
      logger.info(`Fetched ${feedbacks.length} feedbacks for profile: ${profileId}`);
      return {
        feedbacks,
        totalFeedbacks: feedbacks.length,
      };
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error fetching feedbacks for profile ${profileId}: ${err.message}`);
      throw error instanceof ServiceError
        ? error
        : new ServiceError(
            "Failed to fetch feedbacks for profile",
            StatusCodes.INTERNAL_SERVER_ERROR,
            err
          );
    }
  };

  public getFeedbackByCollaborationId = async (collabId: string): Promise<IFeedback[]> => {
    try {
      logger.debug(`Fetching feedbacks for collaboration: ${collabId}`);
      const feedbacks = await this._feedbackRepository.getFeedbackByCollaborationId(collabId);
      logger.info(`Fetched ${feedbacks.length} feedbacks for collaboration: ${collabId}`);
      return feedbacks;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error fetching feedbacks by collaboration ID ${collabId}: ${err.message}`);
      throw error instanceof ServiceError
        ? error
        : new ServiceError(
            "Failed to fetch feedbacks by collaboration ID",
            StatusCodes.INTERNAL_SERVER_ERROR,
            err
          );
    }
  };

  public toggleFeedback = async (feedbackId: string): Promise<IFeedback> => {
    try {
      logger.debug(`Toggling feedback visibility: ${feedbackId}`);
      const feedback = await this._feedbackRepository.toggleIsHidden(feedbackId);
      if (!feedback) {
        logger.error(`Feedback not found: ${feedbackId}`);
        throw new ServiceError("Feedback not found", StatusCodes.NOT_FOUND);
      }

      logger.info(`Toggled feedback visibility: ${feedbackId}`);
      return feedback;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error toggling feedback visibility for feedback ${feedbackId}: ${err.message}`);
      throw error instanceof ServiceError
        ? error
        : new ServiceError(
            "Failed to toggle feedback visibility",
            StatusCodes.INTERNAL_SERVER_ERROR,
            err
          );
    }
  };

  public getFeedbackByMentorId = async (mentorId: string): Promise<IFeedback[]> => {
    try {
      logger.debug(`Fetching feedbacks by mentor ID: ${mentorId}`);
      const feedbacks = await this._feedbackRepository.getFeedbacksByMentorId(mentorId);
      logger.info(`Fetched ${feedbacks.length} feedbacks for mentor: ${mentorId}`);
      return feedbacks;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error fetching feedbacks by mentor ID ${mentorId}: ${err.message}`);
      throw error instanceof ServiceError
        ? error
        : new ServiceError(
            "Failed to fetch feedbacks by mentor ID",
            StatusCodes.INTERNAL_SERVER_ERROR,
            err
          );
    }
  }
}