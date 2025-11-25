import { axiosInstance } from "../lib/axios";
import  { AxiosProgressEvent } from "axios";
import { IChatMessage } from "../types";


export const fetchChatMessages = async (
  contactId?: string,
  groupId?: string,
  page: number = 1,
  limit: number = 10,
  signal?: AbortSignal
): Promise<{ messages: IChatMessage[]; total: number }> => {
  try {
    const response = await axiosInstance.get("/chat/messages", {
      params: { contactId, groupId, page, limit },
      signal,
    });
    return response.data.data;
  } catch (error) {
    if (error.name === "CanceledError") {
      return { messages: [], total: 0 };
    }else{
    console.error("Error fetching chat messages:", error);
    throw error;
    }
  }
};

export const uploadMedia = async (
  file: File,
  senderId: string,
  targetId: string,
  type: string,
  collaborationId?: string,
  userConnectionId?: string,
  groupId?: string,
  onUploadProgress?: (progressEvent: AxiosProgressEvent) => void
): Promise<{ url: string; thumbnailUrl?: string; messageId: string }> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("senderId", senderId);
  formData.append("targetId", targetId);
  formData.append("type", type);
  if (collaborationId) formData.append("collaborationId", collaborationId);
  if (userConnectionId) formData.append("userConnectionId", userConnectionId);
  if (groupId) formData.append("groupId", groupId);

  try {
    const response = await axiosInstance.post("/chat/upload", formData, {
      onUploadProgress, 
    });
    return response.data.data;
  } catch (error) {
    console.error("Error uploading media:", error.message);
    throw error;
  }
};

export const getUnreadMessages = async (userId: string) => {
  try {
    const response = await axiosInstance.get("/chat/unread", {
      params: { userId },
    });
    // console.log("getUnreadMessages response:", response.data); 
    return response.data.data; 
  } catch (error) {
    const errorMessage = error.response
      ? `Status ${error.response.status}: ${error.response.data?.message || error.message}`
      : error.message || "Unknown error in getUnreadMessages";
    console.error("Error fetching chat unread messages:", {
      message: errorMessage,
      error,
    });
    if (error.response?.status === 404 || errorMessage.includes("No messages")) {
      console.log("No unread messages found, returning empty counts");
      return {};
    }
    throw new Error(errorMessage); 
  }
};