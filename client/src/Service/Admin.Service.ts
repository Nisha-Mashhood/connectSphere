import { axiosInstance } from "../lib/axios";
import { handleError } from "./ErrorHandler";

  export const AdminPasscodeCheck = async (passkey) => {
    try {
      const response = await axiosInstance.post("/auth/verify-admin-passkey",{ passkey });
      return response.data; 
    } catch (error) {
      handleError(error) 
    }
  };