import { axiosInstance } from "../lib/axios";
import { handleError } from "./ErrorHandler";

// create Group
export const createGroup = async (groupData: any) => {
  try {
    const response = await axiosInstance.post("/group/create-group", groupData);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

//Get group Details using the adminId
export const groupDetailsWithAdminId = async (id: any) => {
  try {
    const response = await axiosInstance.get(`/group/fetch-groups/${id}`);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

//Get group Details
export const groupDetails = async () => {
  try {
    const response = await axiosInstance.get(`/group/group-details`);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

//send requset to Group
export const sendRequsettoGroup = async (data) => {
  try {
    const response = await axiosInstance.post("/group/send-groupRequest", data);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const getGroupRequestsByUser = async (userId: string) => {
  try {
    const response = await axiosInstance.get(
      `/group/group-requset-details-UI/${userId}`
    );
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch group requests"
    );
  }
};

export const getGroupDetails = async (groupId: string) => {
  try {
    const response = await axiosInstance.get(
      `/group/group-details/${groupId}`
    );
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch group details"
    );
  }
};


export const getGroupRequestsByGroupId = async (groupId: string) => {
  try {
    const response = await axiosInstance.get(
      `/group/group-request-details-GI/${groupId}`
    );
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch admin requests"
    );
  }
};

export const updateGroupRequest = async (requestId: string, status: string) => {
  try {
    const response = await axiosInstance.put("/group/update-groupRequest", {
      requestId,
      status,
    });
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to update request"
    );
  }
};

//Make payment for the mentor
export const processStripePaymentForGroups = async (paymentDetails: any) => {
  try {
    const response = await axiosInstance.post(
      `/group/process-payment`,
      paymentDetails
    );
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

//Remove mebers from group
export const removeUserFromGroup = async (data) => {
  try {
    await axiosInstance.delete(`/group/remove-member`, {data});
  } catch (error) {
    handleError(error);
  }
};

//Remove group
export const removeGroup = async (groupId) => {
  try {
    await axiosInstance.delete(`/group/remove-group/${groupId}`);
  } catch (error) {
    handleError(error);
  }
};


//upload cover photo and profile photo
export const uploadGroupPicture = async (groupId, formData) => {
  try {
    const response = await axiosInstance.put(`/group/upload-group-picture/${groupId}`,formData);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

//get group details for the members
export const groupDetailsForMembers = async (userid) => {
  try {
    const response = await axiosInstance.get(`/group/get-group-details-members/${userid}`);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};