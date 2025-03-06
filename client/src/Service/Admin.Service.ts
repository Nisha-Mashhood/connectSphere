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

  //get all user-mentor  requset
  export const UserToMentorRequset = async() =>{
    try {
      const response = await axiosInstance.get("/collaboration/getAllRequest");
      return response.data; 
    } catch (error) {
      handleError(error) 
    }
  }

  
  //get all user-mentor  Collab
  export const UserToMentorCollab = async() =>{
    try {
      const response = await axiosInstance.get("/collaboration/getAllCollab");
      return response.data; 
    } catch (error) {
      handleError(error) 
    }
  }



  
  