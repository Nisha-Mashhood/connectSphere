// services/userService.js
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

// Fetch all users
export const fetchAllUsers = async () => {
  try {
    const response = await axiosInstance.get("/users/getallusers");
    return response.data;
  } catch (error) {
    toast.error("Failed to fetch users");
    throw error;
  }
};

// Fetch user details by userId
export const fetchUserDetails = async (userId) => {
  try {
    const response = await axiosInstance.get(`/users/getuser/${userId}`);
    return response.data;
  } catch (error) {
    toast.error("Failed to fetch user details");
    throw error;
  }
};

// Block a user
export const blockUser = async (userId) => {
  try {
    await axiosInstance.put(`/users/blockuser/${userId}`);
    toast.success("User blocked successfully");
  } catch (error) {
    toast.error("Failed to block user");
    throw error;
  }
};

// Unblock a user
export const unblockUser = async (userId) => {
  try {
    await axiosInstance.put(`/users/unblockuser/${userId}`);
    toast.success("User unblocked successfully");
  } catch (error) {
    toast.error("Failed to unblock user");
    throw error;
  }
};

// Update user role
export const updateUserRoleService = async (id, role) => {
  try {
    const response = await axiosInstance.put(`/users/changerole/${id}`, { role });
    toast.success("User role updated successfully");
    return response.data;
  } catch (error) {
    toast.error("Failed to update user role");
    throw error;
  }
};

// Verify admin passkey for role update
export const verifyAdminPasskey = async (passkey) => {
  try {
    const response = await axiosInstance.post("/auth/verify-admin-passkey", { passkey });
    return response.data.valid;
  } catch (error) {
    toast.error("Failed to verify admin passkey");
    throw error;
  }
};
