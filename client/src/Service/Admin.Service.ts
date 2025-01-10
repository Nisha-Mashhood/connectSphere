import { axiosInstance } from "../lib/axios";

  export const AdminPasscodeCheck = async (passkey) => {
    try {
      const response = await axiosInstance.post("/auth/verify-admin-passkey",{ passkey });
      return response.data; 
    } catch (error) {
      throw error.response?.data?.message || "Passkey checking Failed"; 
    }
  };