import { axiosInstance } from "../lib/axios";
import { handleError } from "./ErrorHandler";

interface ContactMessage {
  name: string;
  email: string;
  message: string;
}

interface ReplyData {
  email: string;
  replyMessage: string;
}

export const sendContactMessage = async (data: ContactMessage) => {
  try {
    const response = await axiosInstance.post(`/contactUs/contact`, data);
    return response.data.data;
  } catch (error) {
   handleError(error);
  }
};

export const getContactMessages = async () => {
  try {
    const response = await axiosInstance.get("/contactUs/messages");
    return response.data.data;
  } catch (error) {
    handleError(error);
    throw new Error(error.response?.data?.message || "Failed to fetch contact messages");
  }
};

export const sendReply = async (contactMessageId: string, data: ReplyData) => {
  try {
    const response = await axiosInstance.post(`/contactUs/reply/${contactMessageId}`, data);
    return response.data.data;
  } catch (error) {
    handleError(error);
    throw new Error(error.response?.data?.message || "Failed to send reply");
  }
};