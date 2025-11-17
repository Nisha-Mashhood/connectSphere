import { Request, Response, NextFunction } from 'express';
import { inject, injectable } from 'inversify';
import logger from '../core/utils/logger';
import { IFeedback } from '../Interfaces/Models/i-feedback';
import { IFeedbackController } from '../Interfaces/Controller/i-feedBack-controller';
import { HttpError } from '../core/utils/error-handler';
import { StatusCodes } from "../enums/status-code-enums";
import { BaseController } from '../core/controller/base-controller';
import { IFeedbackService } from '../Interfaces/Services/i-feedback-service';
import { FEEDBACK_MESSAGES } from '../constants/messages';
import { ERROR_MESSAGES } from '../constants/error-messages';

@injectable()
export class FeedbackController extends BaseController implements IFeedbackController{
  private _feedbackService: IFeedbackService;

  constructor(@inject('IFeedbackService') feedbackService : IFeedbackService) {
    super();
    this._feedbackService = feedbackService;
  }

    createFeedback = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const feedbackData: Partial<IFeedback> = {
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
        logger.error("Missing required fields");
        throw new HttpError(ERROR_MESSAGES.REQUIRED_FEEDBACK_FIELDS, StatusCodes.BAD_REQUEST);
      }
      const feedback = await this._feedbackService.createFeedback(feedbackData);
      this.sendCreated(res, { feedback }, FEEDBACK_MESSAGES.FEEDBACK_CREATED);
      logger.info("Feedback created successfully");
    } catch (error: any) {
      logger.error(`Error creating feedback: ${error.message}`);
      next(error);
    }
  };

  getMentorFeedbacks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { mentorId } = req.params;
      logger.debug(`Fetching feedbacks for mentor: ${mentorId}`);
      const feedbackData = await this._feedbackService.getMentorFeedbacks(mentorId);
      if (feedbackData.feedbacks.length === 0) {
        this.sendSuccess(res, { feedbacks: [], averageRating: 0, totalFeedbacks: 0 }, FEEDBACK_MESSAGES.NO_FEEDBACKS_FOUND);
        return;
      }

      this.sendSuccess(res, feedbackData, FEEDBACK_MESSAGES.MENTOR_FEEDBACKS_FETCHED);
      logger.info("Mentor feedbacks fetched successfully");
    } catch (error: any) {
      logger.error(`Error fetching mentor feedbacks: ${error.message}`);
      next(error);
    }
  };

  getUserFeedbacks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId } = req.params;
      logger.debug(`Fetching feedbacks for user: ${userId}`);
      const feedbacks = await this._feedbackService.getUserFeedbacks(userId);
      if (feedbacks.length === 0) {
        this.sendSuccess(res, { feedbacks: [] }, FEEDBACK_MESSAGES.NO_FEEDBACKS_FOUND);
        return;
      }

      this.sendSuccess(res, { feedbacks }, FEEDBACK_MESSAGES.USER_FEEDBACKS_FETCHED);
      logger.info("User feedbacks fetched successfully");
    } catch (error: any) {
      logger.error(`Error fetching user feedbacks: ${error.message}`);
      next(error);
    }
  };

  getFeedbackForProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { profileId, profileType } = req.params;
      logger.debug(`Fetching feedbacks for profile: ${profileId}, type: ${profileType}`);
      if (!["mentor", "user"].includes(profileType)) {
        logger.error(`Invalid profile type: ${profileType}`);
        throw new HttpError(ERROR_MESSAGES.INVALID_PROFILE_TYPE, StatusCodes.BAD_REQUEST);
      }
      const feedbackData = await this._feedbackService.getFeedbackForProfile(profileId, profileType as "mentor" | "user");
      if (feedbackData.feedbacks.length === 0) {
        this.sendSuccess(res, { feedbacks: [], totalFeedbacks: 0 }, FEEDBACK_MESSAGES.NO_FEEDBACKS_FOUND);
        return;
      }

      this.sendSuccess(res, feedbackData, FEEDBACK_MESSAGES.PROFILE_FEEDBACKS_FETCHED);
      logger.info("Profile feedbacks fetched successfully");
    } catch (error: any) {
      logger.error(`Error fetching profile feedbacks: ${error.message}`);
      next(error);
    }
  };

  getFeedbackByCollaborationId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { collabId } = req.params;
      logger.debug(`Fetching feedbacks for collaboration: ${collabId}`);
      const feedbacks = await this._feedbackService.getFeedbackByCollaborationId(collabId);
      if (feedbacks.length === 0) {
        this.sendSuccess(res, { feedbacks: [] }, FEEDBACK_MESSAGES.NO_FEEDBACKS_FOUND);
        return;
      }

      this.sendSuccess(res, { feedbacks }, FEEDBACK_MESSAGES.COLLABORATION_FEEDBACKS_FETCHED);
      logger.info("Collaboration feedbacks fetched successfully");
    } catch (error: any) {
      logger.error(`Error fetching collaboration feedbacks: ${error.message}`);
      next(error);
    }
  };

  toggleFeedback = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { feedbackId } = req.params;
      logger.debug(`Toggling feedback visibility: ${feedbackId}`);
      const feedback = await this._feedbackService.toggleFeedback(feedbackId);
      this.sendSuccess(res, { feedback }, FEEDBACK_MESSAGES.FEEDBACK_VISIBILITY_TOGGLED);
      logger.info(`Feedback visibility toggled for: ${feedbackId}`);
    } catch (error: any) {
      logger.error(`Error toggling feedback visibility: ${error.message}`);
      next(error);
    }
  };

  getFeedbackByMentorId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { mentorId } = req.params;
      logger.debug(`Fetching feedbacks by mentor ID: ${mentorId}`);
      const feedbacks = await this._feedbackService.getFeedbackByMentorId(mentorId);
      if (feedbacks.length === 0) {
        this.sendSuccess(res, { feedbacks: [] }, FEEDBACK_MESSAGES.NO_FEEDBACKS_FOUND);
        return;
      }

      this.sendSuccess(res, { feedbacks }, FEEDBACK_MESSAGES.FEEDBACKS_BY_MENTOR_FETCHED);
      logger.info("Feedbacks fetched successfully");
    } catch (error: any) {
      logger.error(`Error fetching feedbacks by mentor ID: ${error.message}`);
      next(error);
    }
  };
}