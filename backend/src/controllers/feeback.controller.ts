import { Request, Response } from "express";
import * as FeedbackService from "../services/feedback.service.js";

export const createFeedback = async (req: Request, res: Response) => {
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
    };

    // console.log(feedbackData)
    const feedback = await FeedbackService.createFeedback(feedbackData);
    res.status(201).json({ success: true, data: feedback });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getMentorFeedbacks = async (req: Request, res: Response) => {
  try {
    const { mentorId } = req.params;
    const feedbackData = await FeedbackService.getMentorFeedbacks(mentorId);
    res.status(200).json({ success: true, data: feedbackData });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getUserFeedbacks = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const feedbacks = await FeedbackService.getUserFeedbacks(userId);
    res.status(200).json({ success: true, data: feedbacks });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getFeedbackOnRoles = async(req: Request, res:Response) =>{
  try {
    const { role, userId, collaborationId } = req.body;
    const feedback = await FeedbackService.getFeedbackByRole(role, userId, collaborationId);
    res.status(200).json({ success: true, feedback });
    return 
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
    return 
  }
}