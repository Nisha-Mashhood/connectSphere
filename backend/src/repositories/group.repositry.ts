import GroupRequest from "../models/groupRequest.model.js";
import Group from "../models/group.model.js";
import mongoose from "mongoose";


export interface GroupFormData {
  name: string;
  bio: string;
  price: number;
  maxMembers: number;
  availableSlots: { day: string; timeSlots: string[] }[];
  profilePic?: string;
  coverPic?: string;
  startDate?: string; 
  adminId: string;
  createdAt?: Date;
  members?: string[];
}

export const createGroupRepository = async (groupData: GroupFormData) => {
  // Create a new group
  const newGroup = new Group(groupData);

  return await newGroup.save();
};

export const getGroupsByAdminId = async (adminId: string) => {
  try {
    const groups = await Group.find({ adminId });
    return groups;
  } catch (error: any) {
    throw new Error(`Error fetching groups: ${error.message}`);
  }
};

export const getGroupsByGroupId = async(groupId : string) =>{
  try {
    const groups = await Group.findById(groupId)
    .populate("members.userId")
    return groups;
  } catch (error: any) {
    throw new Error(`Error fetching groups: ${error.message}`);
  }
}

export const getGroups = async () => {
  try {
    const groups = await Group.find();
    return groups;
  } catch (error: any) {
    throw new Error(`Error fetching groups: ${error.message}`);
  }
};

export const sendRequestToGroup = async (data: {
  groupId: string;
  userId: string;
}) => {
  try {
    const newRequest = await GroupRequest.create({
      groupId: data.groupId,
      userId: data.userId,
      status: "Pending",
      paymentStatus: "Pending",
    });

    return newRequest;
  } catch (error: any) {
    throw new Error("Error creating group request: " + error.message);
  }
};

export const getGroupRequestsByGroupId = async (groupId: string) => {
  try {
    return await GroupRequest.find({ groupId })
      .populate({
        path: "groupId",
        populate: {
          path: "members.userId", // Populating userId inside members array
          model: "User", 
        },
      })
      .populate("userId"); // Populating the user who made the request
  } catch (error: any) {
    throw new Error("Error fetching group requests: " + error.message);
  }
};

export const getGroupRequestsByAdminId = async (adminId: string) => {
  try {
    return await GroupRequest.find({ adminId })
      .populate("groupId")
      .populate("userId");
  } catch (error: any) {
    throw new Error("Error fetching group requests: " + error.message);
  }
};
export const getGroupRequestsByuserId = async (userId: string) => {
  try {
    return await GroupRequest.find({ userId })
      .populate("groupId")
      .populate("userId");
  } catch (error: any) {
    throw new Error("Error fetching group requests: " + error.message);
  }
};

export const findRequestById = async (id: string) => {
  try {
    return await GroupRequest.findById(id);
  } catch (error: any) {
    throw new Error(`Error fetching group request by ID: ${error.message}`);
  }
};

export const findGrouptById = async (id:any) => {
  try {
    return await Group.findById(id);
  } catch (error: any) {
    throw new Error(`Error fetching group  by ID: ${error.message}`);
  }
};

export const updateGroupReqStatus = async (requestId: string, status: "Accepted" | "Rejected") => {
  try {
    const request = await GroupRequest.findById(requestId);
    if (!request) {
      throw new Error("Request not found");
    }

    request.status = status;
    await request.save();
    return request;
  } catch (error: any) {
    throw new Error("Error updating request status: " + error.message);
  }
};


// Function to update payment status after successful payment
export const updateGroupPaymentStatus = async (
  requestId: string,
  amountPaid: number
) => {
  try {
    const request = await GroupRequest.findById(requestId);
    if (!request) {
      throw new Error("Request not found");
    }

    request.paymentStatus = "Completed";
    request.amountPaid = amountPaid;
    await request.save();

    // Add the user to the group as a member
    await addMemberToGroup(request.groupId.toString(), request.userId.toString());
    
    // Delete the group request since payment is completed
    await deleteGroupRequest(requestId);
  } catch (error: any) {
    throw new Error("Error updating payment status: " + error.message);
  }
};

// Function to add a user to a group if they are not already a member
export const addMemberToGroup = async (groupId: string, userId: string) => {
  try {
    const group = await Group.findById(groupId);
    if (!group) {
      throw new Error("Group not found");
    }

    // Check if the user is already a member of the group
    const isUserAlreadyInGroup = group.members.some(
      (member: any) => member.userId.toString() === userId.toString()
    );
    
    if (!isUserAlreadyInGroup) {
      group.members.push({ userId: new mongoose.Types.ObjectId(userId), joinedAt: new Date() });
      await group.save();
    }
  } catch (error: any) {
    throw new Error("Error adding member to group: " + error.message);
  }
};

// Function to delete a group request after it has been processed
export const deleteGroupRequest = async (requestId: string) => {
  try {
    await GroupRequest.findByIdAndDelete(requestId);
  } catch (error: any) {
    throw new Error("Error deleting group request: " + error.message);
  }
};

// Remove a user from the group's member list
export const removeGroupMemberById = async (groupId: string, userId: string) => {
  return await Group.findByIdAndUpdate(
    groupId,
    { $pull: { members: { userId } } },
    { new: true }
  );
};

// Delete a group by ID
export const deleteGroupById = async (groupId: string) => {
  return await Group.findByIdAndDelete(groupId);
};

// Delete all related group requests when deleting a group
export const deleteGroupRequestsByGroupId = async (groupId: string) => {
  return await GroupRequest.deleteMany({ groupId });
};

//update group image
export const updateGroupImageRepositry = async (
  groupId: string,
  updateData: { profilePic?: string; coverPic?: string }
) => {
  return await Group.findByIdAndUpdate(groupId, updateData, { new: true });
};

//get the group details for group members
export const groupDetilsByUserId = async(userId: string) =>{
  const userObjectId = new mongoose.Types.ObjectId(userId);
  try {
    const groupDetails = await Group.find( {"members.userId": userObjectId} )
        .populate("members.userId", "name email jobTitle profilePic")
        .populate("adminId")
        .exec();
        return groupDetails;
  } catch (error) {
    console.error("Error in GroupRepository:", error);
    throw new Error("Error retrieving group details from the database");
  }
}