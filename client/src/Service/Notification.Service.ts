import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { handleError } from "./ErrorHandler";
import { Notification } from "../Interface/User/Inotification";

// export interface Notification {
//   _id: string;
//   userId: string;
//   type:
//     | "message"
//     | "incoming_call"
//     | "missed_call"
//     | "task_reminder"
//     | "new_mentor"
//     | "mentor_approved"
//     | "collaboration_status";
//   content: string;
//   relatedId: string;
//   status: "unread" | "read";
//   senderId: string;
//   notificationDate?: string;
//   notificationTime?: string;
//   createdAt: string;
//   updatedAt: string;
// }

export const fetchNotificationService = async (
  userId: string
): Promise<Notification[]> => {
  try {
    const response = await axiosInstance.get(
      `/notification/getNotification?userId=${userId}`
    );
    console.log("Fetched notifications:", response.data);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    toast.error("Failed to fetch notifications.");
    handleError(error);
    throw error;
  }
};

export const markNotificationAsRead = async (
  userId: string,
  notificationId?: string,
  type?: string
): Promise<Notification> => {
  try {
    console.log(
      `Marking notification as read: notificationId=${notificationId}, userId=${userId}, type=${type}`
    );
    const query = notificationId
      ? `notificationId=${notificationId}&userId=${userId}`
      : `userId=${userId}&type=${type}`;
    const response = await axiosInstance.patch(`/notification/read?${query}`);
    console.log(
      `Notification ${notificationId || type} marked as read:`,
      response.data
    );
    return response.data.data;
  } catch (error) {
    console.error("Error marking notification as read:", error);
    toast.error("Failed to mark notification as read.");
    handleError(error);
    throw error;
  }
};

export const getUnreadCount = async (
  userId: string,
  type?: string
): Promise<number> => {
  const query = type ? `userId=${userId}&type=${type}` : `userId=${userId}`;
  try {
    const response = await axiosInstance.get(
      `/notification/unread-count?${query}`
    );
    return response.data.data.count;
  } catch (error) {
    console.error("Error fetching unread count:", error);
    toast.error("Failed to fetch unread count.");
    handleError(error);
    throw error;
  }
};
