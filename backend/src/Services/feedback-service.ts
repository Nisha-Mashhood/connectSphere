import { inject, injectable } from "inversify";
import { ServiceError } from '../core/utils/error-handler';
import logger from '../core/utils/logger';
import { IFeedback } from '../Interfaces/Models/i-feedback';
import { StatusCodes } from '../enums/status-code-enums';
import { IFeedbackService } from '../Interfaces/Services/i-feedback-service';
import { IFeedbackRepository } from "../Interfaces/Repository/i-feedback-repositry";
import { ICollaborationRepository } from "../Interfaces/Repository/i-collaboration-repositry";
import { IFeedbackDTO } from "../Interfaces/DTOs/i-feedback-dto";
import { toFeedbackDTO, toFeedbackDTOs } from "../Utils/mappers/feedback-mapper";

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

   public createFeedback = async (feedbackData: Partial<IFeedback>): Promise<IFeedbackDTO> => {
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
      const feedbackDTO = toFeedbackDTO(feedback);
      if (!feedbackDTO) {
        logger.error(`Failed to map feedback ${feedback._id} to DTO`);
        throw new ServiceError("Failed to map feedback to DTO", StatusCodes.INTERNAL_SERVER_ERROR);
      }

      logger.info(`Feedback created: ${feedback._id}`);
      return feedbackDTO;
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
  ): Promise<{ feedbacks: IFeedbackDTO[]; averageRating: number; totalFeedbacks: number }> => {
    try {
      logger.debug(`Fetching feedbacks for mentor: ${mentorId}`);
      const feedbacks = await this._feedbackRepository.getFeedbacksByMentorId(mentorId);
      const feedbacksDTO = toFeedbackDTOs(feedbacks);
      const averageRating = await this._feedbackRepository.getMentorAverageRating(mentorId);

      logger.info(`Fetched ${feedbacksDTO.length} feedbacks for mentor: ${mentorId}`);
      return {
        feedbacks: feedbacksDTO,
        averageRating,
        totalFeedbacks: feedbacksDTO.length,
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

  public getUserFeedbacks = async (userId: string): Promise<IFeedbackDTO[]> => {
    try {
      logger.debug(`Fetching feedbacks for user: ${userId}`);
      const feedbacks = await this._feedbackRepository.getFeedbacksByUserId(userId);
      const feedbacksDTO = toFeedbackDTOs(feedbacks);
      logger.info(`Fetched ${feedbacksDTO.length} feedbacks for user: ${userId}`);
      return feedbacksDTO;
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
  ): Promise<{ feedbacks: IFeedbackDTO[]; totalFeedbacks: number }> => {
    try {
      logger.debug(`Fetching feedbacks for profile: ${profileId}, type: ${profileType}`);
      if (!["mentor", "user"].includes(profileType)) {
        logger.error(`Invalid profile type: ${profileType}`);
        throw new ServiceError("Invalid profile type", StatusCodes.BAD_REQUEST);
      }

      const feedbacks = await this._feedbackRepository.getFeedbackForProfile(profileId, profileType);
      const feedbacksDTO = toFeedbackDTOs(feedbacks);
      logger.info(`Fetched ${feedbacksDTO.length} feedbacks for profile: ${profileId}`);
      return {
        feedbacks: feedbacksDTO,
        totalFeedbacks: feedbacksDTO.length,
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

  public getFeedbackByCollaborationId = async (collabId: string): Promise<IFeedbackDTO[]> => {
    try {
      logger.debug(`Fetching feedbacks for collaboration: ${collabId}`);
      const feedbacks = await this._feedbackRepository.getFeedbackByCollaborationId(collabId);
      const feedbacksDTO = toFeedbackDTOs(feedbacks);
      logger.info(`Fetched ${feedbacksDTO.length} feedbacks for collaboration: ${collabId}`);
      return feedbacksDTO;
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

  public toggleFeedback = async (feedbackId: string): Promise<IFeedbackDTO> => {
    try {
      logger.debug(`Toggling feedback visibility: ${feedbackId}`);
      const feedback = await this._feedbackRepository.toggleIsHidden(feedbackId);
      if (!feedback) {
        logger.error(`Feedback not found: ${feedbackId}`);
        throw new ServiceError("Feedback not found", StatusCodes.NOT_FOUND);
      }

      const feedbackDTO = toFeedbackDTO(feedback);
      if (!feedbackDTO) {
        logger.error(`Failed to map feedback ${feedback._id} to DTO`);
        throw new ServiceError("Failed to map feedback to DTO", StatusCodes.INTERNAL_SERVER_ERROR);
      }

      logger.info(`Toggled feedback visibility: ${feedbackId}`);
      return feedbackDTO;
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

  public getFeedbackByMentorId = async (mentorId: string): Promise<IFeedbackDTO[]> => {
    try {
      logger.debug(`Fetching feedbacks by mentor ID: ${mentorId}`);
      const feedbacks = await this._feedbackRepository.getFeedbacksByMentorId(mentorId);
      const feedbacksDTO = toFeedbackDTOs(feedbacks);
      logger.info(`Fetched ${feedbacksDTO.length} feedbacks for mentor: ${mentorId}`);
      return feedbacksDTO;
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