import { axiosInstance } from "../lib/axios";
import { handleError } from "./ErrorHandler";

//Send Mentor requset
export const SendRequsetToMentor = async (data) => {
  try {
    const response = await axiosInstance.post(
      "/collaboration/create-mentorprofile",
      data
    );
    return response.data.data;
  } catch (error) {
    handleError(error);
  }
};

//Get all Requset for the mentor
export const getAllRequest = async (mentorId) => {
  try {
    const response = await axiosInstance.get(
      `/collaboration/get-mentor-requests?mentorId=${mentorId}`
    );
    console.log("Received Requset from backend ", response);
    return response.data.data;
  } catch (error) {
    handleError(error);
  }
};

//Accept the selected mentor request
export const acceptTheRequest = async (requsetId) => {
  try {
    const response = await axiosInstance.post(
      `/collaboration/accept-request/${requsetId}`
    );
    return response.data.data;
  } catch (error) {
    handleError(error);
  }
};

//Reject the selected mentor request
export const rejectTheRequest = async (requsetId) => {
  try {
    const response = await axiosInstance.post(
      `/collaboration/reject-request/${requsetId}`
    );
    return response.data.data;
  } catch (error) {
    handleError(error);
  }
};

//get the requset for user
export const getTheRequestByUser = async (userId) => {
  try {
    const response = await axiosInstance.get(
      `/collaboration/get-user-requests/${userId}`
    );
    return response.data.data;
  } catch (error) {
    handleError(error);
  }
};

//Make payment for the mentor
export const processStripePayment = async (paymentDetails) => {
  try {
    const response = await axiosInstance.post(
      `/collaboration/process-payment`,
      paymentDetails
    );
    return response.data.data;
  } catch (error) {
    handleError(error);
  }
};

//get collab data for user
export const getCollabDataforUser = async (userId) => {
  try {
    const response = await axiosInstance.get(
      `/collaboration/get-collabData-user/${userId}`
    );
    return response.data.data;
  } catch (error) {
    handleError(error);
  }
};

//get collab data for mentor
export const getCollabDataforMentor = async (mentorId) => {
  try {
    const response = await axiosInstance.get(
      `/collaboration/get-collabData-mentor/${mentorId}`
    );
    return response.data.data;
  } catch (error) {
    handleError(error);
  }
};

//Cancel Mentorship
export const cancelAndRefundCollab = async (collabId, reason, amount) => {
  try {
    const response = await axiosInstance.delete(
      `/collaboration/cancel-and-refund/${collabId}`,
      {
        data: { reason, amount },
      }
    );
    return response.data.data;
  } catch (error) {
    handleError(error);
  }
};

//get collab details
export const fetchCollabDetails = async (collabId) => {
  try {
    const response = await axiosInstance.get(
      `/collaboration/getCollab/${collabId}`
    );
    return response.data.data;
  } catch (error) {
    handleError(error);
  }
};
//get requset details
export const fetchCollabRequsetDetails = async (requestId) => {
  try {
    const response = await axiosInstance.get(
      `/collaboration/getCollabRequset/${requestId}`
    );
    return response.data.data;
  } catch (error) {
    handleError(error);
  }
};

//get all user-mentor  requset
export const UserToMentorRequset = async (page = 1, limit = 10, search = "") => {
  try {
    const response = await axiosInstance.get("/collaboration/getAllRequest", {
      params: { page, limit, search },
    });
    return response.data.data;
  } catch (error) {
    handleError(error);
    return { requests: [], total: 0, pages: 1 }; 
  }
};

//get all user-mentor collab
export const UserToMentorCollab = async (page = 1, limit = 10, search = "") => {
  try {
    const response = await axiosInstance.get("/collaboration/getAllCollab", {
      params: { page, limit, search },
    });
    return response.data.data;
  } catch (error) {
    handleError(error);
    return { collabs: [], total: 0, pages: 1 }; 
  }
};

// Mark dates as unavailable
export const markDatesUnavailable = async (collabId, data) => {
  try {
    const response = await axiosInstance.put(
      `/collaboration/markUnavailable/${collabId}`,
      data
    );
    return response.data.data;
  } catch (error) {
    handleError(error);
  }
};

// Update time slots
export const updateTimeSlots = async (collabId, data) => {
  try {
    const response = await axiosInstance.put(
      `/collaboration/updateTimeslot/${collabId}`,
      data
    );
    return response.data.data;
  } catch (error) {
    handleError(error);
  }
};

// Approve or reject time slot request
export const approveTimeSlotRequest = async (collabId, requestId, isApproved, requestType) => {
  try {
    const response = await axiosInstance.put(
      `/collaboration/approveTimeSlot/${collabId}`,
      { requestId, isApproved, requestType }
    );
    return response.data.data;
  } catch (error) {
    handleError(error);
  }
};

//Find locked slot
export const getLockedMentorSlot= async (mentorId) => {
  try {
    const response = await axiosInstance.get(`/collaboration/locked-slots/${mentorId}`,);
    return response.data.data;
  } catch (error) {
    handleError(error);
  }
};

//Handle refund
export const processRefund = async (collabId: string, reason: string, amount: number) => {
  console.log('Sending refund request:', { collabId, reason, amount }); 
  try {
    const response = await axiosInstance.post(`/collaboration/refund/${collabId}`, {
      reason,
      amount,
    });
    console.log('Refund response:', response.data);
    return response.data.data;
  } catch (error) {
    console.error('Refund request error:', error); 
    handleError(error);
  }
};