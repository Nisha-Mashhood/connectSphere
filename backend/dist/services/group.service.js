import { createGroupRepository, getGroupRequestsByAdminId, getGroupRequestsByGroupId, getGroupRequestsByuserId, getGroups, getGroupsByAdminId, sendRequestToGroup, updateGroupRequestStatus, } from "../repositories/group.repositry.js";
export const createGroupService = async (groupData) => {
    if (!groupData.name || !groupData.bio || !groupData.adminId) {
        throw new Error("Missing required fields: name, bio, or adminId");
    }
    if (!groupData.availableSlots || groupData.availableSlots.length === 0) {
        throw new Error("At least one available slot is required");
    }
    // Process data if necessary
    const groupPayload = {
        ...groupData,
        createdAt: new Date(),
    };
    return await createGroupRepository(groupPayload);
};
//Get group details using adminId
export const fetchGroupDetails = async (adminId) => {
    try {
        // Fetch groups using the repository
        const groups = await getGroupsByAdminId(adminId);
        return groups;
    }
    catch (error) {
        throw new Error(`Error in service layer: ${error.message}`);
    }
};
//Get all Groups
export const fetchGroups = async () => {
    try {
        // Fetch groups using the repository
        const groups = await getGroups();
        return groups;
    }
    catch (error) {
        throw new Error(`Error in service layer: ${error.message}`);
    }
};
//send requset to the group
export const requestToJoinGroup = async (groupId, userId) => {
    return await sendRequestToGroup({ groupId, userId });
};
//fetch group requset by groupId
export const fetchGroupRequestsByGroupId = async (groupId) => {
    return await getGroupRequestsByGroupId(groupId);
};
//fetch group requset by AdminId
export const fetchGroupRequestsByAdminId = async (adminId) => {
    return await getGroupRequestsByAdminId(adminId);
};
//fetch group requset by UserId
export const fetchGroupRequestsByuserId = async (userId) => {
    return await getGroupRequestsByuserId(userId);
};
//update the status to approved / rejected
export const modifyGroupRequestStatus = async (requestId, status) => {
    return await updateGroupRequestStatus(requestId, status);
};
//# sourceMappingURL=group.service.js.map