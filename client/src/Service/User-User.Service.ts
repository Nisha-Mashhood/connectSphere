import { axiosInstance } from "../lib/axios";
import { handleError } from "./ErrorHandler";

//Send user-user requset
export const sendUser_UserRequset = async(requesterId, recipientId) =>{
    try {
        await axiosInstance.post(`/user-userCollab/sendUser-User/${requesterId}`, { recipientId });
      } catch (error) {
        handleError(error)
      }
}