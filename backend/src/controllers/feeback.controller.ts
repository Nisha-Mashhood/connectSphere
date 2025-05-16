import { Request, Response } from "express";
import * as FeedbackService from "../services/feedback.service.js";
import { AnyExpression } from "mongoose";

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
      givenBy:req.body.role,
    };

    const feedback = await FeedbackService.createFeedback(feedbackData);
    console.log(feedback)
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


export const getFeedbackForProfile = async (req: Request, res: Response) => {
  try {
    const { profileId, profileType } = req.params;
    console.log('profile Id :',profileId);
    console.log('Profile Type : ',profileType);
    if (!["mentor", "user"].includes(profileType)) {
       res.status(400).json({ success: false, message: "Invalid profile type" });
       return
    }
    const feedbackData = await FeedbackService.getFeedbackForProfile(
      profileId,
      profileType as "mentor" | "user"
    );
    res.status(200).json({ success: true, data: feedbackData });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getFeedBack = async (req: Request, res: Response) => {
  try {
    const { collabId } = req.params;
    const feedback = await FeedbackService.getFeedbackByCollaborationId(collabId);
    res.status(200).json({ success: true, data: feedback });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const toggleFeedback = async (req: Request, res: Response) => {
  try {
    const { feedbackId } = req.params;
    const feedback = await FeedbackService.toggleFeedbackservice(feedbackId);
    res.status(200).json({ success: true, data: feedback });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getFeedBackByMentorId = async(req: Request, res: Response) =>{
  try {
    const { mentorId } = req.params;
    const feedback = await FeedbackService.getFeedBackByMentorIdService(mentorId);
    res.status(200).json({success: true, data: feedback});
  } catch (error:AnyExpression) {
    res.status(400).json({ success: false, message: error.message });
  }
}