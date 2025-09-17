import { Request, Response, NextFunction } from 'express';
import { inject } from 'inversify';
import logger from '../Core/Utils/Logger';
import { IFeedback } from '../Interfaces/Models/IFeedback';
import { IFeedbackController } from '../Interfaces/Controller/IFeedBackController';
import { HttpError } from '../Core/Utils/ErrorHandler';
import { StatusCodes } from "../Enums/StatusCode.constants";
import { BaseController } from '../Core/Controller/BaseController';
import { IFeedbackService } from '../Interfaces/Services/IFeedbackService';

export class FeedbackController extends BaseController implements IFeedbackController{
  private _feedbackService: IFeedbackService;

  constructor(@inject('IFeedbackService') feedbackService : IFeedbackService) {
    super();
    this._feedbackService = feedbackService;
  }

    createFeedback = async(req: Request, res: Response, next:NextFunction): Promise<void> =>{
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
        logger.error('Missing required fields');
        throw new HttpError('Missing required fields: userId, mentorId, collaborationId, or rating', StatusCodes.BAD_REQUEST);
      }
      const feedback = await this._feedbackService.createFeedback(feedbackData);
      this.sendCreated(res, { feedback }, 'Feedback created successfully');
      logger.info('Feedback created successfully');
    } catch (error: any) {
      logger.error(`Error creating feedback: ${error.message}`);
      next(error)
    }
  }

    getMentorFeedbacks = async(req: Request, res: Response, next:NextFunction): Promise<void> =>{
    try {
      const { mentorId } = req.params;
      logger.debug(`Fetching feedbacks for mentor: ${mentorId}`);
      const feedbackData = await this._feedbackService.getMentorFeedbacks(mentorId);
      if (feedbackData.feedbacks.length === 0) {
        this.sendSuccess(res, { feedbacks: [], averageRating: 0, totalFeedbacks: 0 }, 'No feedbacks found');
        return;
      }

      this.sendSuccess(res, feedbackData, 'Mentor feedbacks fetched successfully');
      logger.info('Mentor feedbacks fetched successfully');
    } catch (error: any) {
      logger.error(`Error fetching mentor feedbacks: ${error.message}`);
      next(error)
    }
  }

    getUserFeedbacks = async(req: Request, res: Response, next:NextFunction): Promise<void> =>{
    try {
      const { userId } = req.params;
      logger.debug(`Fetching feedbacks for user: ${userId}`);
      const feedbacks = await this._feedbackService.getUserFeedbacks(userId);
      if (feedbacks.length === 0) {
        this.sendSuccess(res, { feedbacks: [] }, 'No feedbacks found');
        return;
      }

      this.sendSuccess(res, { feedbacks }, 'User feedbacks fetched successfully');
      logger.info('User feedbacks fetched successfully');
    } catch (error: any) {
      logger.error(`Error fetching user feedbacks: ${error.message}`);
      next(error)
    }
  }

    getFeedbackForProfile = async(req: Request, res: Response, next:NextFunction): Promise<void> =>{
    try {
      const { profileId, profileType } = req.params;
      logger.debug(`Fetching feedbacks for profile: ${profileId}, type: ${profileType}`);
      if (!['mentor', 'user'].includes(profileType)) {
        logger.error(`Invalid profile type: ${profileType}`);
        throw new HttpError('Invalid profile type', StatusCodes.BAD_REQUEST);
      }
      const feedbackData = await this._feedbackService.getFeedbackForProfile(profileId, profileType as 'mentor' | 'user');
      if (feedbackData.feedbacks.length === 0) {
        this.sendSuccess(res, { feedbacks: [], totalFeedbacks: 0 }, 'No feedbacks found');
        return;
      }

      this.sendSuccess(res, feedbackData, 'Profile feedbacks fetched successfully');
      logger.info('Profile feedbacks fetched successfully');
    } catch (error: any) {
      logger.error(`Error fetching profile feedbacks: ${error.message}`);
      next(error)
    }
  }

    getFeedbackByCollaborationId = async(req: Request, res: Response, next:NextFunction): Promise<void> =>{
    try {
      const { collabId } = req.params;
      logger.debug(`Fetching feedbacks for collaboration: ${collabId}`);
      const feedbacks = await this._feedbackService.getFeedbackByCollaborationId(collabId);
      if (feedbacks.length === 0) {
        this.sendSuccess(res, { feedbacks: [] }, 'No feedbacks found');
        return;
      }

      this.sendSuccess(res, { feedbacks }, 'Collaboration feedbacks fetched successfully');
      logger.info('Collaboration feedbacks fetched successfully');
    } catch (error: any) {
      logger.error(`Error fetching collaboration feedbacks: ${error.message}`);
      next(error)
    }
  }

    toggleFeedback= async(req: Request, res: Response, next:NextFunction): Promise<void> =>{
    try {
      const { feedbackId } = req.params;
      logger.debug(`Toggling feedback visibility: ${feedbackId}`);
      const feedback = await this._feedbackService.toggleFeedback(feedbackId);
      this.sendSuccess(
        res,
        { feedback },
        `Feedback visibility toggled to ${feedback.isHidden ? 'hidden' : 'visible'}`
      );
      logger.info(`Feedback visibility toggled for: ${feedbackId}`);
    } catch (error: any) {
      logger.error(`Error toggling feedback visibility: ${error.message}`);
      next(error)
    }
  }

    getFeedbackByMentorId = async(req: Request, res: Response, next:NextFunction): Promise<void> =>{
    try {
      const { mentorId } = req.params;
      logger.debug(`Fetching feedbacks by mentor ID: ${mentorId}`);
      const feedbacks = await this._feedbackService.getFeedbackByMentorId(mentorId);
      if (feedbacks.length === 0) {
        this.sendSuccess(res, { feedbacks: [] }, 'No feedbacks found');
        return;
      }

      this.sendSuccess(res, { feedbacks }, 'Feedbacks fetched successfully');
      logger.info('Feedbacks fetched successfully');
    } catch (error: any) {
      logger.error(`Error fetching feedbacks by mentor ID: ${error.message}`);
      next(error)
    }
  }
}