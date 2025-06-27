import { axiosInstance } from "../lib/axios";
import { handleError } from "./ErrorHandler";

//Send feedback (create a feedback document)
export const sendFeedBack = async (feedbackData) => {
    try {
      const response = await axiosInstance.post("/feedback/send-feedback", feedbackData);
      return response.data.data;
    } catch (error) {
      handleError(error);
    }
  };


  export const getFeedBack = async (data) => {
    try {
      const response = await axiosInstance.get("/feedback/get-feedback",{data});
      return response.data.data;
    } catch (error) {
      handleError(error);
    }
  };

    export const getFeedbackByMentorId = async (mentorId) => {
    try {
      const response = await axiosInstance.get(`/feedback/get-feedbackByMentorId/${mentorId}`);
      return response.data.data;
    } catch (error) {
      handleError(error);
    }
  };


    export const getFeedbackByCollaborationId = async (collabId) => {
    try {
      const response = await axiosInstance.get(`/feedback/get-feedbackByCollabId/${collabId}`);
      return response.data.data;
    } catch (error) {
      handleError(error);
    }
  };

  export const getFeedbackForProfile = async (
    profileId: string,
    profileType: "mentor" | "user"
  ) => {
    try {
      const response = await axiosInstance.get(`/feedback/profile/${profileId}/${profileType}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching feedback for ${profileType}:`, error);
      handleError(error);
    }
  };

  export const toggleFeedbackVisibility = async (feedbackId) => {
  try {
    const response = await axiosInstance.patch(`/feedback/toggle-visibility/${feedbackId}`);
    return response.data.data;
  } catch (error) {
    console.error(`Toggle visibility error for feedback ${feedbackId}:`, error.response?.data || error.message);
    handleError(error);
  }
};