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
export const fetchMentorRequests = async (
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
  sortOrder: 'asc' | 'desc'
) => {
  try {
    const response = await axiosInstance.get('/mentors/mentor-analytics', {
      params: { page, limit, sortBy, sortOrder },
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
