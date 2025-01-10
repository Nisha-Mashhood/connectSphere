import { axiosInstance } from "../lib/axios";

export const register = async (data) => {
  try {
    const response = await axiosInstance.post("/auth/register/signup", data);
    return response.data; 
  } catch (error) {
    throw error.response?.data?.message || "Login failed"; 
  }
};

export const login = async (data) => {
    try {
      const response = await axiosInstance.post("/auth/login", data);
      return response.data; 
    } catch (error) {
      throw error.response?.data?.message || "Login failed"; 
    }
  };
  
  export const logout = async (email) => {
    try {
      await axiosInstance.post("/auth/logout" , { email });
    } catch (error) {
      throw error.response?.data?.message || "Logging out failed";
    }
  };

  export const checkProfile = async (userId) => {
    try {
      const response = await axiosInstance.get(`/auth/check-profile/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Profile check failed";
    }
  };

  export const fetchUserDetails = async(userId) =>{
    try {
      const response = await axiosInstance.get(`/auth/profiledetails/${userId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching user details:", error);
      throw error;
    }
  }

  export const updateUserDetails = async(userId:string, formData: FormData) =>{
    try {
      const response = await axiosInstance.put(`/auth/updateUserDetails/${userId}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        });
      return response.data;
    } catch (error) {
      console.error("Error updating user details:", error);
      throw error;
    }
  }

  export const sentOTP = async(email:string) =>{
    try {
      await axiosInstance.post("/auth/register/forgot-password",email);
    } catch (error) {
      console.error("Error Sending OTP:", error);
      throw error;
    }
  }
  export const verifyOTP = async(data) =>{
    try {
      const response = await axiosInstance.post("/auth/register/verify-otp",data);
      return response;
    } catch (error) {
      console.error("Error Verifying OTP:", error);
      throw error;
    }
  }

  export const resetPassword = async(data) =>{
    try {
      await axiosInstance.post("/auth/register/reset-password",data);
    } catch (error) {
      console.error("Error during reseting password:", error);
      throw error;
    }
  }