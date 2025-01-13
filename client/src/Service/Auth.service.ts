import { axiosInstance } from "../lib/axios";
import { handleError } from "./ErrorHandler";

export const register = async (data) => {
  try {
    const response = await axiosInstance.post("/auth/register/signup", data);
    return response.data;
  } catch (error) {
   handleError(error)
  }
};

export const login = async (data) => {
  try {
    const response = await axiosInstance.post("/auth/login", data);
    return response.data;
  } catch (error) {
    handleError(error)
  }
};

export const logout = async (email) => {
  try {
    await axiosInstance.post("/auth/logout", { email });
  } catch (error) {
    handleError(error)
  }
};

export const checkProfile = async (userId) => {
  try {
    const response = await axiosInstance.get(`/auth/check-profile/${userId}`);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const fetchUserDetails = async (userId) => {
  try {
    const response = await axiosInstance.get(`/auth/profiledetails/${userId}`);
    return response.data;
  } catch (error) {
    handleError(error)
  }
};

export const updateUserDetails = async (userId: string, formData: FormData) => {
  try {
    const response = await axiosInstance.put(
      `/auth/updateUserDetails/${userId}`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return response.data;
  } catch (error) {
    handleError(error)
  }
};

export const sentOTP = async (email: string) => {
  try {
    console.log(email);
    await axiosInstance.post("/auth/register/forgot-password", { email });
  } catch (error) {
    handleError(error)
  }
};
export const verifyOTP = async (data) => {
  try {
    const response = await axiosInstance.post(
      "/auth/register/verify-otp",
      data
    );
    return response;
  } catch (error) {
    handleError(error)
  }
};

export const resetPassword = async (data) => {
  try {
    await axiosInstance.post("/auth/register/reset-password", data);
  } catch (error) {
    handleError(error)
  }
};
