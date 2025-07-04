// services/userService.js
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { handleError } from "./ErrorHandler";

// Fetch all users
export const fetchAllUsers = async () => {
  try {
    const response = await axiosInstance.get("/auth/getallusers");
    return response.data.data.users;
  } catch (error) {
    handleError(error)
  }
};

// Fetch user details by userId
export const fetchUserDetails = async (userId) => {
  try {
    const response = await axiosInstance.get(`/auth/getuser/${userId}`);
    return response.data.data;
  } catch (error) {
    handleError(error)
  }
};

// Block a user
export const blockUserService = async (userId) => {
  try {
    const response = await axiosInstance.put(`/auth/blockuser/${userId}`);
    return response.data.data;
    toast.success("User blocked successfully");
  } catch (error) {
    handleError(error)
  }
};

// Unblock a user
export const unblockUserService = async (userId) => {
  try {
    const response = await axiosInstance.put(`/auth/unblockuser/${userId}`);
    return response.data.data;
    toast.success("User unblocked successfully");
  } catch (error) {
    handleError(error)
  }
};

// Update user role
export const updateUserRoleService = async (id, role) => {
  try {
    const response = await axiosInstance.put(`/auth/changerole/${id}`, { role });
    return response.data.data;
  } catch (error) {
    handleError(error)
  }
};

// Verify admin passkey for role update
export const verifyAdminPasskey = async (passkey) => {
  try {
    const response = await axiosInstance.post("/auth/verify-admin-passkey", { passkey });
    return response.data.data.valid;
  } catch (error) {
    handleError(error)
  }
};

export const updateUserImages = async(userId: string, formData: FormData) =>{
  try {
    const response = await axiosInstance.put(`/auth/updateUserDetails/${userId}`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data.data;
  } catch (error) {
    handleError(error)
  }
}

export const updateUserProfessionalInfo = async(userId: string, data: { industry: string; reasonForJoining: string; jobTitle: string }) =>{
  try {
    const response = await axiosInstance.put(`/auth/updateUserDetails/${userId}`, data);
      return response.data.data;
  } catch (error) {
    handleError(error)
  }
}

// Update contact information
export const updateContactInfo = async (userId: string, data: { email: string; phone: string; dateOfBirth: string }) => {
  try {
    const response = await axiosInstance.put(`/auth/updateUserDetails/${userId}`, data);
    return response.data.data;
  } catch (error) {
    handleError(error)
  }
};
