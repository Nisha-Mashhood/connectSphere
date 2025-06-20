import { axiosInstance } from "../lib/axios";
import { handleError } from "./ErrorHandler";

//Send user-user requset
export const sendUser_UserRequset = async (requesterId, recipientId) => {
  try {
    const response = await axiosInstance.post(`/user-userCollab/sendUser-User/${requesterId}`, {
      recipientId,
    });
    return response.data.data
  } catch (error) {
    handleError(error);
  }
};

// Respond to User-User Request (Accept/Reject)
export const respondToUser_UserRequest = async (
  connectionId: string,
  action: "Accepted" | "Rejected"
) => {
  try {
    const response =await axiosInstance.put(`/user-userCollab/respond/${connectionId}`, {
      action: action,
    });
    return response.data.data;
  } catch (error) {
    handleError(error);
  }
};

// Disconnect User-User Connection
export const disconnectUser_UserConnection = async (
  connectionId: string,
  disconnectionReason?: string
) => {
  try {
    const response = await axiosInstance.put(`/user-userCollab/disconnect/${connectionId}`, {
      disconnectionReason,
    });
    return response.data.data;
  } catch (error) {
    handleError(error);
  }
};


// Get All User Connections
export const getUser_UserConnections = async (userId: string) => {
  try {
    const response = await axiosInstance.get(
      `/user-userCollab/connections/${userId}`
    );
    console.log("Data comingfrom backend :",response);
    return response.data.data;
  } catch (error) {
    handleError(error);
  }
};

//Fetch connection details using the connectionId
export const User_UserConnectionsById = async (connectionId: string) => {
  console.log("connection Id :",connectionId)
  try {
    const response = await axiosInstance.get(
      `/user-userCollab/getConnection/${connectionId}`
    );
    return response.data.data;
  } catch (error) {
    handleError(error);
  }
};

// Get Sent & Received User-User Requests
export const getUser_UserRequests = async (userId: string) => {
  try {
    const response = await axiosInstance.get(
      `/user-userCollab/connections/${userId}/requests`
    );
    return response.data.data;
  } catch (error) {
    handleError(error);
  }
};

  //Fetch all user-user connection
  export const fetchAllUserConnections = async () => {
    try {
      const response = await axiosInstance.get(
        `/user-userCollab/getAllconnection`
      );
      return response.data.data;
    } catch (error) {
      handleError(error);
    }
  };