import { axiosInstance } from "../lib/axios";
import { handleError } from "./ErrorHandler";

// Submit Review
export const submit_review = async (userId: string, rating: number, comment: string) => {
  try {
    const response = await axiosInstance.post(`/reviews/submit`, {
      userId,
      rating,
      comment,
    });
    return response.data.data;
  } catch (error) {
    handleError(error);
  }
};

// Skip Review
export const skip_review = async (userId: string) => {
  try {
    const response = await axiosInstance.post(`/reviews/skip`, { userId });
    return response.data.data;
  } catch (error) {
    handleError(error);
  }
};

// Get All Reviews (Admin)
export const get_all_reviews = async () => {
  try {
    const response = await axiosInstance.get(`/reviews/all`);
    return response.data.data;
  } catch (error) {
    handleError(error);
  }
};

// Get Selected Reviews (Frontend Display)
export const get_selected_reviews = async () => {
  try {
    const response = await axiosInstance.get(`/reviews/selected`);
    return response.data.data;
  } catch (error) {
    handleError(error);
  }
};

// Approve Review (Admin)
export const approve_review = async (reviewId: string) => {
  try {
    const response = await axiosInstance.patch(`/reviews/approve/${reviewId}`);
    return response.data.data;
  } catch (error) {
    handleError(error);
  }
};

// Select Review (Admin)
export const select_review = async (reviewId: string) => {
  try {
    const response = await axiosInstance.patch(`/reviews/select/${reviewId}`);
    return response.data.data;
  } catch (error) {
    handleError(error);
  }
};

//Cancel Approve Review (Admin)
export const cancel_approval = async (reviewId: string) => {
  try {
    const response = await axiosInstance.patch(`/reviews/cancel/${reviewId}`);
    return response.data.data;
  } catch (error) {
    handleError(error);
  }
};

//Deselect Review (Admin)
export const deselect_review = async (reviewId: string) => {
  try {
    const response = await axiosInstance.patch(`/reviews/deselect/${reviewId}`);
    return response.data.data;
  } catch (error) {
    handleError(error);
  }
};