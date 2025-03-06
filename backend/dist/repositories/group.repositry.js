import GroupRequest from "../models/groupRequest.model.js";
import Group from "../models/group.model.js";
import mongoose from "mongoose";
export const createGroupRepository = async (groupData) => {
    // Create a new group
    const newGroup = new Group(groupData);
    return await newGroup.save();
};
export const getGroupsByAdminId = async (adminId) => {
    try {
        const groups = await Group.find({ adminId });
        return groups;
    }
    catch (error) {
        throw new Error(`Error fetching groups: ${error.message}`);
    }
};
export const getGroupsByGroupId = async (groupId) => {
    try {
        const groups = await Group.findById(groupId)
            .populate("members.userId")
            .populate("adminId");
        return groups;
    }
    catch (error) {
        throw new Error(`Error fetching groups: ${error.message}`);
    }
};
export const getGroups = async () => {
    try {
        const groups = await Group.find();
        return groups;
    }
    catch (error) {
        throw new Error(`Error fetching groups: ${error.message}`);
    }
};
export const sendRequestToGroup = async (data) => {
    try {
        const newRequest = await GroupRequest.create({
            groupId: data.groupId,
            userId: data.userId,
            status: "Pending",
            paymentStatus: "Pending",
        });
        return newRequest;
    }
    catch (error) {
        throw new Error("Error creating group request: " + error.message);
    }
};
export const getGroupRequestsByGroupId = async (groupId) => {
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
    }
    catch (error) {
        throw new Error("Error fetching group requests: " + error.message);
    }
};
export const getGroupRequestsByAdminId = async (adminId) => {
    try {
        return await GroupRequest.find({ adminId })
            .populate("groupId")
            .populate("userId");
    }
    catch (error) {
        throw new Error("Error fetching group requests: " + error.message);
    }
};
export const getGroupRequestsByuserId = async (userId) => {
    try {
        return await GroupRequest.find({ userId })
            .populate("groupId")
            .populate("userId");
    }
    catch (error) {
        throw new Error("Error fetching group requests: " + error.message);
    }
};
export const findRequestById = async (id) => {
    try {
        return await GroupRequest.findById(id);
    }
    catch (error) {
        throw new Error(`Error fetching group request by ID: ${error.message}`);
    }
};
export const findGrouptById = async (id) => {
    try {
        return await Group.findById(id)
            .populate("members.userId")
            .populate("adminId");
    }
    catch (error) {
        throw new Error(`Error fetching group  by ID: ${error.message}`);
    }
};
export const updateGroupReqStatus = async (requestId, status) => {
    try {
        const request = await GroupRequest.findById(requestId);
        if (!request) {
            throw new Error("Request not found");
        }
        request.status = status;
        await request.save();
        return request;
    }
    catch (error) {
        throw new Error("Error updating request status: " + error.message);
    }
};
// Function to update payment status after successful payment
export const updateGroupPaymentStatus = async (requestId, amountPaid) => {
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
    }
    catch (error) {
        throw new Error("Error updating payment status: " + error.message);
    }
};
// Function to add a user to a group if they are not already a member
export const addMemberToGroup = async (groupId, userId) => {
    try {
        const group = await Group.findById(groupId);
        if (!group) {
            throw new Error("Group not found");
        }
        // Check if the user is already a member of the group
        const isUserAlreadyInGroup = group.members.some((member) => member.userId.toString() === userId.toString());
        if (!isUserAlreadyInGroup) {
            group.members.push({ userId: new mongoose.Types.ObjectId(userId), joinedAt: new Date() });
            await group.save();
        }
    }
    catch (error) {
        throw new Error("Error adding member to group: " + error.message);
    }
};
// Function to delete a group request after it has been processed
export const deleteGroupRequest = async (requestId) => {
    try {
        await GroupRequest.findByIdAndDelete(requestId);
    }
    catch (error) {
        throw new Error("Error deleting group request: " + error.message);
    }
};
// Remove a user from the group's member list
export const removeGroupMemberById = async (groupId, userId) => {
    return await Group.findByIdAndUpdate(groupId, { $pull: { members: { userId } } }, { new: true });
};
// Delete a group by ID
export const deleteGroupById = async (groupId) => {
    return await Group.findByIdAndDelete(groupId);
};
// Delete all related group requests when deleting a group
export const deleteGroupRequestsByGroupId = async (groupId) => {
    return await GroupRequest.deleteMany({ groupId });
};
//update group image
export const updateGroupImageRepositry = async (groupId, updateData) => {
    return await Group.findByIdAndUpdate(groupId, updateData, { new: true });
};
//get the group details for group members
export const groupDetilsByUserId = async (userId) => {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    try {
        const groupDetails = await Group.find({ "members.userId": userObjectId })
            .populate("members.userId", "name email jobTitle profilePic")
            .populate("adminId")
            .exec();
        return groupDetails;
    }
    catch (error) {
        console.error("Error in GroupRepository:", error);
        throw new Error("Error retrieving group details from the database");
    }
};
//FOR ADMIN
// export const getAllGroups = async() =>{
//   try {
//     const groups = await Group.find()
//     .populate("members.userId")
//     .populate("adminId")
//     return groups;
//   } catch (error: any) {
//     throw new Error(`Error fetching groups: ${error.message}`);
//   }
// }
// //get getDetails using groupId
// export const getGroupDeatilsById = async(groupId:string) =>{
//   try {
//     const groupDetails = await Group.findById(groupId)
//     .populate("members.userId")
//     .populate("adminId");
//     return groupDetails;
//   } catch (error:any) {
//     throw new Error(`Error fetching group Details: ${error.message}`);
//   }
// }
//get all group requsets
export const getAllGrouprequsets = async () => {
    try {
        const AllGrouprequsets = await GroupRequest.find()
            .populate("groupId")
            .populate("userId");
        return AllGrouprequsets;
    }
    catch (error) {
        throw new Error(`Error fetching group Requsets: ${error.message}`);
    }
};
//get the group requset details using requset Id
export const getGroupRequsetById = async (requsetId) => {
    try {
        const groupRequsetDetails = await GroupRequest.findById(requsetId)
            .populate("groupId")
            .populate("userId");
        return groupRequsetDetails;
    }
    catch (error) {
        throw new Error(`Error fetching group Requset Details: ${error.message}`);
    }
};
//# sourceMappingURL=group.repositry.js.map