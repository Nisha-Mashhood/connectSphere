import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { handleError } from "./ErrorHandler";

export interface Notification {
  _id: string;
  userId: string;
  type: "message" | "incoming_call" | "missed_call" | "task_reminder";
  content: string;
  relatedId: string;
  status: "unread" | "read";
  senderId: string;
  notificationDate?: string;
  notificationTime?: string;
  createdAt: string;
  updatedAt: string;
}

  export const fetchNotificationService = async (userId: string): Promise<Notification[]> => {
    try {
      const response = await axiosInstance.get(`/notification/getNotification?userId=${userId}`);
      console.log("Fetched notifications:", response.data);
      return response.data.data;
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast.error("Failed to fetch notifications.");
      handleError(error);
      throw error;
    }
  };
  
  export const markNotificationAsRead = async (notificationId: string, userId: string): Promise<Notification> => {
    try {
      const response = await axiosInstance.patch(`/notification/${notificationId}/read`, { userId });
      console.log(`Notification ${notificationId} marked as read:`, response.data);
      return response.data.data;
    } catch (error) {
      console.error("Error marking notification as read:", error);
      toast.error("Failed to mark notification as read.");
      handleError(error);
      throw error;
    }
  };
  
  export const getUnreadCount = async (userId: string): Promise<number> => {
    try {
      const response = await axiosInstance.get(`/notification/unread-count?userId=${userId}`);
      console.log("Fetched unread count:", response.data.count);
      return response.data.data.count;
    } catch (error) {
      console.error("Error fetching unread count:", error);
      toast.error("Failed to fetch unread count.");
      handleError(error);
      throw error;
    }
  };
  