import { axiosInstance } from "../lib/axios";

// Add interceptors to handle token refresh
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If the error is 401 and we haven't tried to refresh the token yet
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Call refresh token endpoint
        const response = await axiosInstance.post("/auth/refresh-token");
        const { newAccessToken } = response.data;

        // Retry the original request
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        return axiosInstance(originalRequest);
      } catch (error) {
        // If refresh token fails, redirect to login
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

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
      if (error.response?.status === 403) {
        throw new Error("Your account has been blocked");
      }
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
      if (error.response?.status === 403) {
        throw new Error("Your account has been blocked");
      }
      throw error.response?.data?.message || "Profile check failed";
    }
  };

  export const fetchUserDetails = async(userId) =>{
    try {
      const response = await axiosInstance.get(`/auth/profiledetails/${userId}`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 403) {
        throw new Error("Your account has been blocked");
      }
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
      if (error.response?.status === 403) {
        throw new Error("Your account has been blocked");
      }
      console.error("Error updating user details:", error);
      throw error;
    }
  }

  export const sentOTP = async(email:string) =>{
    try {
      console.log(email);
      await axiosInstance.post("/auth/register/forgot-password",{email});
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