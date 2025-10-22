import { axiosInstance } from "../lib/axios";
import { handleError } from "./ErrorHandler";

export const register = async (data) => {
  try {
    const response = await axiosInstance.post("/auth/register/signup", data);
    return response.data.data;
  } catch (error) {
   handleError(error)
  }
};

export const login = async (data) => {
  try {
    const response = await axiosInstance.post("/auth/login", data);
    console.log("Response from backend ", response);
    return response.data.data;
  } catch (error) {
    handleError(error)
  }
};

export const logout = async (email) => {
  try {
    const response = await axiosInstance.post("/auth/logout", { email });
    return response.data.data
  } catch (error) {
    handleError(error)
  }
};

export const checkProfile = async (userId) => {
  try {
    const response = await axiosInstance.get(`/auth/check-profile/${userId}`);
    return response.data.data;
  } catch (error) {
    handleError(error);
  }
};

export const fetchUserDetails = async (userId) => {
  try {
    const response = await axiosInstance.get(`/auth/profiledetails/${userId}`);
    return response.data.data;
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
    return response.data.data;
  } catch (error) {
    handleError(error)
  }
};

export const sentOTP = async (email: string) => {
  try {
    console.log(email);
    const response = await axiosInstance.post("/auth/register/forgot-password", { email });
    return response.data.data
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

    console.log("Response from backend :",response);
    return response.data;
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


export const googleSignup = async (code) => {
  try {
    const response = await axiosInstance.post('/auth/google-signup', {code});
    return response.data.data;
  } catch (error) {
    console.log(error)
    handleError(error);
  }
};

export const googleLogin = async (code: string) => {
  try {
    const response = await axiosInstance.post('/auth/google-login', { code });
    return response.data.data;
  } catch (error) {
    console.error('Google Login Error:', error);
    handleError(error);
  }
};

// Handles git signup
export const githubSignup = async (code: string) => {
  try {
    console.log("Calling github signup with code:", code);
    const response = await axiosInstance.post('/auth/github-signup', { code });
    return response.data.data; 
  } catch (error) {
    if (error.response?.data?.message === "Email already registered.") {
      throw new Error("Email already registered. Please login instead.");
    }
    console.error("Error during GitHub signup:", error);
    throw error;
  }
};

// Handles git Login
export const githubLogin = async (code: string) => {
  try {
    console.log("Calling github login with code:", code);
    const response = await axiosInstance.post('/auth/github-login', { code });
    return response.data.data; 
  } catch (error) {
    console.error("Error during GitHub login:", error);
    throw error;
  }
};
