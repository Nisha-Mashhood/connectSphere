import { axiosInstance } from "../lib/axios";
import { AxiosProgressEvent } from "axios";
import { IChatMessage } from "../types";


export const fetchChatMessages = async (
  contactId?: string,
  groupId?: string,
  page: number = 1,
  limit: number = 10
): Promise<{ messages: IChatMessage[]; total: number }> => {
  try {
    const response = await axiosInstance.get("/chat/messages", {
      params: { contactId, groupId, page, limit },
    });
    return response.data.data;
  } catch (error) {
    console.error("Error fetching chat messages:", error.message);
    throw error;
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

export const getUnreadMessages = async(userId: string) =>{
  try {
    const response = await axiosInstance.get("/chat/unread", {
      params: { userId },
    });
    return response.data.data;
  } catch (error) {
    console.error("Error fetching chat messages:", error.message);
    throw error;
  }
}