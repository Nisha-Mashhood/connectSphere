import axios from "axios";
import { axiosInstance } from "../lib/axios";
import { handleError } from "./ErrorHandler";

// Align with the FormattedContact interface from getUserContactsService
interface Contact {
  _id: string;
  contactId: string;
  userId: string;
  targetId: string;
  type: "user-mentor" | "user-user" | "group";
  targetName: string;
  targetProfilePic: string;
  collaborationId?: string; // Add for user-mentor
  userConnectionId?: string; // Add for user-user
  groupId?: string; // Add for group
}

export const getUserContacts = async (): Promise<Contact[]> => {
  try {
    const token = localStorage.getItem("authToken");
    console.log("Fetching contacts from /contacts/user with token:", token);
    const response = await axiosInstance.get(`/contacts/user`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("API response status:", response.status);
    console.log("API response data:", response.data);

    if (!response.data) {
      console.warn("Response data is empty or undefined");
      return [];
    }

    const contacts = response.data.data || response.data;
    console.log("Extracted contacts:", contacts);
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