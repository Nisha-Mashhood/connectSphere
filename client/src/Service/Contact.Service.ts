import axios from "axios";
import { axiosInstance } from "../lib/axios";
import { handleError } from "./ErrorHandler";

export const getUserContacts = async () => {
  try {
    const token = localStorage.getItem("authToken");
    // console.log("Fetching contacts from /contacts/user with token:", token);
    const response = await axiosInstance.get(`/contacts/user`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.data) {
      console.warn("Response data is empty or undefined");
      return [];
    }

    const contacts = response.data.data || response.data;
    // console.log("Extracted contacts:", contacts);
    return contacts;
  } catch (error) {
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