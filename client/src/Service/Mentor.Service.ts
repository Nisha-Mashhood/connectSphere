import { IMentorExperience } from "../Interface/Admin/IMentor";
import { axiosInstance } from "../lib/axios";
import { handleError } from "./ErrorHandler";

export interface MentorAnalytics {
  mentorId: string;
  name: string;
  email: string;
  specialization: string | undefined;
  approvalStatus: string | undefined;
  totalCollaborations: number;
  totalEarnings: number;
  platformFees: number;
  avgCollabPrice: number;
}

// Fetch mentor requests
export const createMentorProfile = async (formdata:FormData) => {
  try {
    const response = await axiosInstance.post("/mentors/create-mentorprofile",formdata);
    return response.data.data;
  } catch (error) {
    handleError(error)
  }
};

// Fetch mentor requests
export const fetchMentorRequestsService = async (
  page: number = 1,
  limit: number = 10,
  search: string = "",
  status: string = "",
  sort: string = "desc"
) => {
  try {
    const response = await axiosInstance.get("/mentors/getallmentorrequest", {
      params: { page, limit, search, status, sort },
    });
    return response.data.data;
  } catch (error) {
    handleError(error);
  }
};

//Fetch Mentor Deatils using mentor Id
export const fetchMentorById = async (mentorId) => {
  try {
    const response = await axiosInstance.get(`/mentors/getmentorDetails/${mentorId}`);
    return response.data.data;
  } catch (error) {
    handleError(error)
  }
}

export const getMentorExperiences = async (mentorId: string) => {
  try {
    const response = await axiosInstance.get(`/mentors/experiences/${mentorId}`);
    return response.data.data || [];
  } catch (error) {
    console.error("Failed to fetch mentor experiences", error);
    throw error;
  }
};

//Fetch All Mentors
export const fetchAllMentors = async (params) => {
  try {
    const response = await axiosInstance.get("/mentors/getAllMentors", { params });
    return response.data.data;
  } catch (error) {
    handleError(error);
  }
}

// Approve mentor request
export const approveMentor = async (mentorId) => {
  try {
    await axiosInstance.put(`/mentors/approvementorrequest/${mentorId}`);
  } catch (error) {
    handleError(error)
  }
};

// Cancel mentorship
export const cancelMentorship = async (mentorId) => {
  try {
    await axiosInstance.put(`/mentors/cancelmentorship/${mentorId}`);
  } catch (error) {
    handleError(error)
  }
};

// Reject mentor request
export const rejectMentor = async (mentorId:string, reason) => {
  try {
    await axiosInstance.put(`/mentors/rejectmentorrequest/${mentorId}`, {
      reason,
    });
  }catch (error) {
    handleError(error)
  }
};

export const checkMentorProfile = async (userId) => {
  try {
    const response = await axiosInstance.get(`/mentors/check-mentor/${userId}`);
    return response.data.data;
  } catch (error) {
    handleError(error)
  }
};

export const getAllMentorProfile = async (userId) => {
  try {
    const response = await axiosInstance.get(`/auth/check-profile/${userId}`);
    return response.data.data;
  } catch (error) {
    handleError(error)
  }
};

//update Mentor Profile
export const updateMentorProfile = async(mentorId, mentorInfo) =>{
  try {
    const response = await axiosInstance.put(`/mentors/update-mentor/${mentorId}`,mentorInfo);
    return response.data.data;
  } catch (error) {
    handleError(error)
  }
}

  export const getMentorAnalytics = async (
  page: number,
  limit: number,
  sortBy: 'totalEarnings' | 'platformFees' | 'totalCollaborations' | 'avgCollabPrice',
  sortOrder: 'asc' | 'desc',
  search: string = ""
) => {
  try {
    const response = await axiosInstance.get('/mentors/mentor-analytics', {
      params: { page, limit, sortBy, sortOrder, search },
    });
    return response.data.data;
  } catch (error) {
    handleError(error);
  }
};

export const getSalesReport = async (period: string) => {
  try {
    const response = await axiosInstance.get('/mentors/sales-report', { params: { period } });
    return response.data.data;
  } catch (error) {
    handleError(error);
  }
};

//Add Mentor Experience
export const addMentorExperience = async (userId:string, experienceData: Omit<IMentorExperience, "id">) => {
  try {
    const response = await axiosInstance.post(`/mentors/experiences/?userId=${userId}`, experienceData);
    return response.data.data;
  } catch (error) {
    handleError(error);
  }
};

// Update Existing Experience
export const updateMentorExperience = async (userId: string ,experienceId: string, experienceData: Partial<IMentorExperience>) => {
  try {
    const response = await axiosInstance.put(`/mentors/experiences/${experienceId}?userId=${userId}`, experienceData);
    return response.data.data;
  } catch (error) {
    handleError(error);
  }
};

// Delete Experience
export const deleteMentorExperience = async (userId:string, experienceId: string) => {
  try {
    await axiosInstance.delete(`/mentors/deleteexperiences/${experienceId}?userId=${userId}`);
  } catch (error) {
    handleError(error);
  }
};

//Download Sales Report
export const downloadSalesReport = async (period: string) => {
  try {
    const response = await axiosInstance.get("/mentors/downloadSalesReport", {
      params: { period },
      responseType: "blob",
    });

    const blob = new Blob([response.data], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;

    const periodLabel =
      period === "1month" ? "last-30-days" :
      period === "1year" ? "last-1-year" :
      "last-5-years";

    link.download = `sales-report-${periodLabel}-${new Date().toISOString().split("T")[0]}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

  } catch (error) {
    console.error("Download failed:", error);
    handleError(error);
  }
};

