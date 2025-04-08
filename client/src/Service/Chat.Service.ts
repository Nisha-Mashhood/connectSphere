import { axiosInstance } from "../lib/axios";
import { AxiosProgressEvent } from "axios";

export interface IChatMessage {
  _id: string;
  senderId: string;
  content: string;
  contentType: "text" | "image" | "video" | "file";
  timestamp: string;
  collaborationId?: string;
  userConnectionId?: string;
  groupId?: string;
  thumbnailUrl?: string;
  fileMetadata?: { fileName: string; fileSize: number; mimeType: string };
}

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
  } catch (error: any) {
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
  } catch (error: any) {
    console.error("Error uploading media:", error.message);
    throw error;
  }
};