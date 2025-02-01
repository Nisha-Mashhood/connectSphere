import GroupRequest from "../models/groupRequest.model.js";
import Group from "../models/group.model.js";
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
            .populate("groupId")
            .populate("userId");
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
export const updateGroupRequestStatus = async (requestId, status) => {
    try {
        return await GroupRequest.findByIdAndUpdate(requestId, { status }, { new: true });
    }
    catch (error) {
        throw new Error("Error updating request status: " + error.message);
    }
};
//# sourceMappingURL=group.repositry.js.map