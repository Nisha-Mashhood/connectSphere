import { axiosInstance } from "../lib/axios";
import { handleError } from "./ErrorHandler";

// Fetch mentor requests
export const createMentorProfile = async (formdata:FormData) => {
  try {
    await axiosInstance.post("/mentors/create-mentorprofile",formdata);
  } catch (error) {
    handleError(error)
  }
};

// Fetch mentor requests
export const fetchMentorRequests = async () => {
  try {
    const { data } = await axiosInstance.get("/mentors/getallmentorrequest");
    return data;
  } catch (error) {
    handleError(error)
  }
};

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
export const rejectMentor = async (mentorId:string, rejectionReason) => {
  try {
    await axiosInstance.delete(`/mentors/rejectmentorrequest/${mentorId}`, {
      data: { rejectionReason },
    });
  } catch (error) {
    handleError(error)
  }
};

export const checkMentorProfile = async (userId) => {
  try {
    const response = await axiosInstance.get(`/mentors/check-mentor/${userId}`);
    return response.data;
  } catch (error) {
    handleError(error)
  }
};

export const getAllMentorProfile = async (userId) => {
  try {
    const response = await axiosInstance.get(`/auth/check-profile/${userId}`);
    return response.data;
  } catch (error) {
    handleError(error)
  }
};