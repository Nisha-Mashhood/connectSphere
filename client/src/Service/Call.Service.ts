import { axiosInstance } from "../lib/axios";
import { ICallLog } from "../types";
import { handleError } from "./ErrorHandler";


export const getCallLogs = async (): Promise<ICallLog[]> => {
  try {
    const response = await axiosInstance.get("/callLog/call-logs");
    return response.data.data;
  } catch (error) {
    handleError(error);
    throw new Error(error.response?.data?.message || "Failed to fetch call logs");
  }
};