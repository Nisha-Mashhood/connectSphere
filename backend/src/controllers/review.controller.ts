import { Request, Response } from "express";
import * as ReviewService from "../services/review.service.js";

export const submitReview = async (req: Request, res: Response) => {
  try {
    const { userId, rating, comment } = req.body;
    if (!userId || !rating || !comment) {
      console.log("Missing required fields");
    }
    const review = await ReviewService.submitReview(userId, rating, comment);
    res.status(201).json({ success: true, data: review });
  } catch (error: any) {
    res
      .status(error.status || 500)
      .json({ success: false, message: error.message });
  }
};

export const skipReview = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      console.log("Missing userId");
    }
    await ReviewService.skipReview(userId);
    res.status(200).json({ success: true, message: "Review skipped" });
  } catch (error: any) {
    res
      .status(error.status || 500)
      .json({ success: false, message: error.message });
  }
};

export const getAllReviews = async (_req: Request, res: Response) => {
  try {
    const reviews = await ReviewService.getAllReviews();
    res.status(200).json({ success: true, data: reviews });
  } catch (error: any) {
    res
      .status(error.status || 500)
      .json({ success: false, message: error.message });
  }
};

export const approveReview = async (req: Request, res: Response) => {
  try {
    const { reviewId } = req.params;
    const review = await ReviewService.approveReview(reviewId);
    res.status(200).json({ success: true, data: review });
  } catch (error: any) {
    res
      .status(error.status || 500)
      .json({ success: false, message: error.message });
  }
};

export const selectReview = async (req: Request, res: Response) => {
  try {
    const { reviewId } = req.params;
    const review = await ReviewService.selectReview(reviewId);
    res.status(200).json({ success: true, data: review });
  } catch (error: any) {
    res
      .status(error.status || 500)
      .json({ success: false, message: error.message });
  }
};

export const getSelectedReviews = async (_req: Request, res: Response) => {
  try {
    const reviews = await ReviewService.getSelectedReviews();
    res.status(200).json({ success: true, data: reviews });
  } catch (error: any) {
    res
      .status(error.status || 500)
      .json({ success: false, message: error.message });
  }
};

export const cancelApproval = async (req: Request, res: Response) => {
  try {
    const { reviewId } = req.params;
    const review = await ReviewService.cancelApproval(reviewId);
    res.status(200).json({ success: true, data: review });
  } catch (error: any) {
    res
      .status(error.status || 500)
      .json({ success: false, message: error.message });
  }
};

export const deselectReview = async (req: Request, res: Response) => {
  try {
    const { reviewId } = req.params;
    const review = await ReviewService.deselectReview(reviewId);
    res.status(200).json({ success: true, data: review });
  } catch (error: any) {
    res
      .status(error.status || 500)
      .json({ success: false, message: error.message });
  }
};
