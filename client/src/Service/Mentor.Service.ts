import { axiosInstance } from "../lib/axios";

// Fetch mentor requests
export const createMentorProfile = async (formdata:FormData) => {
  try {
    await axiosInstance.post("/mentors/create-mentorprofile",formdata);
  } catch (error) {
    throw new Error("Failed to create mentor Profile.");
  }
};

// Fetch mentor requests
export const fetchMentorRequests = async () => {
  try {
    const { data } = await axiosInstance.get("/mentors/getallmentorrequest");
    return data;
  } catch (error) {
    throw new Error("Failed to fetch mentor requests.");
  }
};

// Approve mentor request
export const approveMentor = async (mentorId) => {
  try {
    await axiosInstance.put(`/mentors/approvementorrequest/${mentorId}`);
  } catch (error) {
    throw new Error("Failed to approve mentor.");
  }
};

// Cancel mentorship
export const cancelMentorship = async (mentorId) => {
  try {
    await axiosInstance.put(`/mentors/cancelmentorship/${mentorId}`);
  } catch (error) {
    throw new Error("Failed to cancel mentorship.");
  }
};

// Reject mentor request
export const rejectMentor = async (mentorId:string, rejectionReason) => {
  try {
    await axiosInstance.delete(`/mentors/rejectmentorrequest/${mentorId}`, {
      data: { rejectionReason },
    });
  } catch (error) {
    throw new Error("Failed to reject mentor.");
  }
};

export const checkMentorProfile = async (userId) => {
  try {
    const response = await axiosInstance.get(`/auth/check-profile/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Mentor Profile check failed";
  }
};

export const getAllMentorProfile = async (userId) => {
  try {
    const response = await axiosInstance.get(`/auth/check-profile/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Mentor Profile check failed";
  }
};