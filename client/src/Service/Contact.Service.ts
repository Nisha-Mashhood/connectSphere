import axios from "axios";
import { axiosInstance } from "../lib/axios";
import { handleError } from "./ErrorHandler";

export interface Contact {
  id: string;
  contactId: string;
  userId: string;
  targetId: string;
  type: "user-mentor" | "user-user" | "group";
  name: string;
  profilePic: string;
  targetJobTitle?: string;
  collaborationId?: string;
  collaborationDetails?: {
    startDate: Date;
    endDate?: Date;
    price: number;
    selectedSlot: { day: string; timeSlots: string[] }[];
    mentorName: string;
    mentorProfilePic: string;
    mentorJobTitle?: string;
    userName: string;
    userProfilePic: string;
    userJobTitle?: string;
  };
  userConnectionId?: string;
  connectionDetails?: {
    requestAcceptedAt?: Date;
    requesterName: string;
    requesterProfilePic: string;
    requesterJobTitle?: string;
    recipientName: string;
    recipientProfilePic: string;
    recipientJobTitle?: string;
  };
  groupId?: string;
  groupDetails?: {
    groupName: string;
    startDate: Date;
    adminName: string;
    adminProfilePic: string;
    maxMembers: number;
    bio: string;
    price: number;
    availableSlots: { day: string; timeSlots: string[] }[];
    members: { 
      userId: string; 
      name: string; 
      profilePic: string; 
      joinedAt: Date 
    }[];
  };
}
export const getUserContacts = async (): Promise<Contact[]> => {
  try {
    const token = localStorage.getItem("authToken");
    console.log("Fetching contacts from /contacts/user with token:", token);
    const response = await axiosInstance.get(`/contacts/user`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    // console.log("API response status:", response.status);
    // console.log("API response data:", response.data);

    if (!response.data) {
      console.warn("Response data is empty or undefined");
      return [];
    }

    const contacts = response.data.data || response.data;
    // console.log("Extracted contacts:", contacts);
    return contacts;
  } catch (error: any) {
    console.error("Error fetching contacts:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      isCancel: axios.isCancel(error),
    });
    handleError(error);
    return [];
  }
};