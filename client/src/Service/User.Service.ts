// services/userService.js
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { handleError } from "./ErrorHandler";

// Fetch all users
export const fetchAllUsers = async () => {
  try {
    const response = await axiosInstance.get("/users/getallusers");
    return response.data;
  } catch (error) {
    handleError(error)
  }
};

// Fetch user details by userId
export const fetchUserDetails = async (userId) => {
  try {
    const response = await axiosInstance.get(`/users/getuser/${userId}`);
    return response.data;
  } catch (error) {
    handleError(error)
  }
};

// Block a user
export const blockUserService = async (userId) => {
  try {
    await axiosInstance.put(`/users/blockuser/${userId}`);
    toast.success("User blocked successfully");
  } catch (error) {
    handleError(error)
  }
};

// Unblock a user
export const unblockUserService = async (userId) => {
  try {
    await axiosInstance.put(`/users/unblockuser/${userId}`);
    toast.success("User unblocked successfully");
  } catch (error) {
    handleError(error)
  }
};

// Update user role
export const updateUserRoleService = async (id, role) => {
  try {
    const response = await axiosInstance.put(`/users/changerole/${id}`, { role });
    toast.success("User role updated successfully");
    return response.data;
  } catch (error) {
    handleError(error)
  }
};

// Verify admin passkey for role update
export const verifyAdminPasskey = async (passkey) => {
  try {
    const response = await axiosInstance.post("/auth/verify-admin-passkey", { passkey });
    return response.data.valid;
  } catch (error) {
    handleError(error)
  }
};
