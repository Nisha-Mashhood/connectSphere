import GroupRequest from "../models/groupRequest.model.js";
import Group from "../models/group.model.js";

export interface GroupFormData {
    name: string;
    bio: string;
    price: number;
    maxMembers: number;
    availableSlots: { day: string; timeSlots: string[] }[];
    profilePic?: string;
    coverPic?: string;
    adminId: string;
    createdAt?: Date;
    members?: string[];
  }

export const createGroupRepository = async (groupData: GroupFormData) => {
    // Create a new group 
    const newGroup = new Group(groupData);
  
    return await newGroup.save();
  };

export const getGroupsByAdminId = async(adminId:string) =>{
try {
    const groups = await Group.find({ adminId })
    return groups;
} catch (error:any) {
    throw new Error(`Error fetching groups: ${error.message}`);
}
}

export const getGroups = async() =>{
    try {
        const groups = await Group.find()
        return groups;
    } catch (error:any) {
        throw new Error(`Error fetching groups: ${error.message}`);
    }
    }

    export const sendRequestToGroup = async (data: { groupId: string; userId: string }) => {
        try {
          const newRequest = await GroupRequest.create({
            groupId: data.groupId,
            userId: data.userId,
            status: "Pending",
            paymentStatus: "Pending",
          });
      
          return newRequest;
        } catch (error:any) {
          throw new Error("Error creating group request: " + error.message);
        }
      };

      export const getGroupRequestsByGroupId = async (groupId: string) => {
        try {
          return await GroupRequest.find({ groupId })
          .populate("groupId")
          .populate("userId")
        } catch (error:any) {
          throw new Error("Error fetching group requests: " + error.message);
        }
      };

      export const getGroupRequestsByAdminId = async (adminId: string) => {
        try {
          return await GroupRequest.find({ adminId })
          .populate("groupId")
          .populate("userId")
        } catch (error:any) {
          throw new Error("Error fetching group requests: " + error.message);
        }
      };
      export const getGroupRequestsByuserId = async (userId: string) => {
        try {
          return await GroupRequest.find({ userId })
          .populate("groupId")
          .populate("userId")
        } catch (error:any) {
          throw new Error("Error fetching group requests: " + error.message);
        }
      };

      export const updateGroupRequestStatus = async (requestId: string, status: "Approved" | "Rejected") => {
        try {
          return await GroupRequest.findByIdAndUpdate(requestId, { status }, { new: true });
        } catch (error:any) {
          throw new Error("Error updating request status: " + error.message);
        }
      };