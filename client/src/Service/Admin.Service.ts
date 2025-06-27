import { axiosInstance } from "../lib/axios";
import { handleError } from "./ErrorHandler";

  export const AdminPasscodeCheck = async (passkey) => {
    try {
      const response = await axiosInstance.post("/auth/verify-admin-passkey",{ passkey });
      return response.data.data; 
    } catch (error) {
      handleError(error) 
    }
  };
  
// Get total users count
export const getTotalUsersCount = async () => {
  try {
    const response = await axiosInstance.get("/admin/total-users");
    return response.data.data;
  } catch (error) {
    handleError(error);
  }
};

// Get total mentors count
export const getTotalMentorsCount = async () => {
  try {
    const response = await axiosInstance.get("/admin/total-mentors");
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

// Get total revenue
export const getTotalRevenue = async () => {
  try {
    const response = await axiosInstance.get("/admin/total-revenue");
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

// Get pending mentor requests count
export const getPendingMentorRequestsCount = async () => {
  try {
    const response = await axiosInstance.get("/admin/pending-mentor-requests/count");
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

// Get active collaborations count
export const getActiveCollaborationsCount = async () => {
  try {
    const response = await axiosInstance.get("/admin/active-collaborations/count");
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

// Get revenue trends data
export const getRevenueTrends = async (timeFormat, days) => {
  try {
    const response = await axiosInstance.get("/admin/revenue-trends", {
      params: { timeFormat, days }
    });
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

// Get user growth data
export const getUserGrowth = async (timeFormat, days) => {
  try {
    const response = await axiosInstance.get("/admin/user-growth", {
      params: { timeFormat, days }
    });
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

// Get pending mentor requests
export const getPendingMentorRequests = async (limit) => {
  try {
    const response = await axiosInstance.get("/admin/pending-mentor-requests", {
      params: { limit }
    });
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

// Get top mentors
export const getTopMentors = async (limit) => {
  try {
    const response = await axiosInstance.get("/admin/top-mentors", {
      params: { limit }
    });
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

// Get recent collaborations
export const getRecentCollaborations = async (limit) => {
  try {
    const response = await axiosInstance.get("/admin/recent-collaborations", {
      params: { limit }
    });
    return response.data;
  } catch (error) {
    handleError(error);
  }
};
  