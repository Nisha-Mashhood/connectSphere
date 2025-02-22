import { axiosInstance } from "../lib/axios";
import { handleError } from "./ErrorHandler";

//Send feedback (create a feedback document)
export const sendFeedBackToMentor = async (feedbackData: any) => {
    try {
      const response = await axiosInstance.post("/feedback/send-feedback", feedbackData);
      return response.data;
    } catch (error) {
      handleError(error);
    }
  };