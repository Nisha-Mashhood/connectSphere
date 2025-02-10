import { createGroupService, deleteGroupByIdService, fetchGroupDetails, fetchGroupDetailsService, fetchGroupRequestsByAdminId, fetchGroupRequestsByGroupId, fetchGroupRequestsByuserId, fetchGroups, groupDetilsForMembers, modifyGroupRequestStatus, processGroupPaymentService, removeMemberFromGroup, requestToJoinGroup, updateGroupImageService, } from "../services/group.service.js";
import { findRequestById } from "../repositories/group.repositry.js";
import fs from "fs";
import { uploadImage } from "../utils/cloudinary.utils.js";
export const createGroup = async (req, res) => {
    try {
        const groupData = req.body;
        const createdGroup = await createGroupService(groupData);
        res.status(201).json({
            success: true,
            message: "Group created successfully",
            data: createdGroup,
        });
    }
    catch (error) {
        console.error("Error in createGroupController:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Internal server error",
        });
    }
};
export const getGroupDetails = async (req, res) => {
    const { adminId } = req.params;
    try {
        const groupDetails = await fetchGroupDetails(adminId);
        if (groupDetails.length === 0) {
            res.status(404).json({ message: "No groups found for this admin." });
            return;
        }
        res
            .status(200)
            .json({ message: "Groups fetched successfully", data: groupDetails });
        return;
    }
    catch (error) {
        res.status(500).json({ message: error.message });
        return;
    }
};
export const getGroupDetailsByGroupId = async (req, res) => {
    const { groupId } = req.params;
    try {
        const groupDetails = await fetchGroupDetailsService(groupId);
        // Check if groupDetails is null or undefined
        if (!groupDetails) {
            res.status(404).json({ message: "No group found with the provided ID." });
            return;
        }
        res
            .status(200)
            .json({ message: "Groups fetched successfully", data: groupDetails });
        return;
    }
    catch (error) {
        res.status(500).json({ message: error.message });
        return;
    }
};
export const getGroups = async (_req, res) => {
    try {
        const groupDetails = await fetchGroups();
        if (groupDetails.length === 0) {
            res.status(404).json({ message: "No groups found." });
            return;
        }
        res
            .status(200)
            .json({ message: "Groups fetched successfully", data: groupDetails });
        return;
    }
    catch (error) {
        res.status(500).json({ message: error.message });
        return;
    }
};
export const sendGroupRequset = async (req, res) => {
    const { groupId, userId } = req.body;
    try {
        const requsetDeatils = await requestToJoinGroup(groupId, userId);
        res
            .status(201)
            .json({ message: "Requset send successfully", data: requsetDeatils });
        return;
    }
    catch (error) {
        res.status(500).json({ message: error.message });
        return;
    }
};
export const getrequsetDeatilsbyGroupId = async (req, res) => {
    const { groupId } = req.params;
    try {
        const requsetDeatils = await fetchGroupRequestsByGroupId(groupId);
        res
            .status(201)
            .json({ message: "Requset accessed successfully", data: requsetDeatils });
        return;
    }
    catch (error) {
        res.status(500).json({ message: error.message });
        return;
    }
};
export const getrequsetDeatilsbyAdminId = async (req, res) => {
    const { adminId } = req.params;
    try {
        const requsetDeatils = await fetchGroupRequestsByAdminId(adminId);
        res
            .status(201)
            .json({ message: "Requset accessed successfully", data: requsetDeatils });
        return;
    }
    catch (error) {
        res.status(500).json({ message: error.message });
        return;
    }
};
export const getrequsetDeatilsbyUserId = async (req, res) => {
    const { userId } = req.params;
    try {
        const requsetDeatils = await fetchGroupRequestsByuserId(userId);
        res
            .status(201)
            .json({ message: "Requset accessed successfully", data: requsetDeatils });
        return;
    }
    catch (error) {
        res.status(500).json({ message: error.message });
        return;
    }
};
export const updaterequsetDeatils = async (req, res) => {
    const { requestId, status } = req.body;
    try {
        const requsetDeatils = await modifyGroupRequestStatus(requestId, status);
        res
            .status(201)
            .json({ message: "Requset updated successfully", data: requsetDeatils });
        return;
    }
    catch (error) {
        res.status(500).json({ message: error.message });
        return;
    }
};
//Make payemnt requset
export const makeStripePaymentController = async (req, res) => {
    const { token, amount, requestId, groupRequestData } = req.body;
    console.log(req.body);
    try {
        // Retrieve the mentor request document
        const groupRequest = await findRequestById(requestId);
        if (!groupRequest) {
            res
                .status(404)
                .json({ status: "failure", message: "Group request not found" });
            return;
        }
        // Process payment and handle members in group collection
        const paymentResult = await processGroupPaymentService(token, amount, requestId, groupRequestData);
        res.status(200).json({ status: "success", charge: paymentResult });
        return;
    }
    catch (error) {
        console.error("Payment error:", error.message);
        res.status(500).json({ status: "failure", error: error.message });
        return;
    }
};
export const removeGroupMember = async (req, res) => {
    const { groupId, userId } = req.body;
    try {
        const response = await removeMemberFromGroup(groupId, userId);
        res.status(200).json({ status: "success", response });
    }
    catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({ status: "failure", error: error.message });
    }
};
export const deleteGroup = async (req, res) => {
    const { groupId } = req.params;
    try {
        const response = await deleteGroupByIdService(groupId);
        res
            .status(200)
            .json({
            status: "success",
            message: "Group deleted successfully",
            response,
        });
    }
    catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({ status: "failure", error: error.message });
    }
};
//Update the profile picture and cover picture for the group
export const updateGroupImage = async (req, res) => {
    try {
        const { groupId } = req.params;
        const files = req.files;
        if (!files || Object.keys(files).length === 0) {
            res.status(400).json({ error: "No file uploaded" });
            return;
        }
        // Extract the profile or cover photo if available
        const profilePic = files["profilePic"]?.[0] || null;
        const coverPic = files["coverPic"]?.[0] || null;
        if (!profilePic && !coverPic) {
            res.status(400).json({ error: "Invalid file upload" });
            return;
        }
        let profilePicUrl;
        let coverPicUrl;
        // Function to delete file
        const deleteFile = (filePath) => {
            fs.unlink(filePath, (err) => {
                if (err)
                    console.error(`Error deleting file: ${filePath}`, err);
            });
        };
        // Upload profile picture if available
        if (files["profilePic"]?.[0]) {
            const profilePicPath = files["profilePic"][0].path;
            profilePicUrl = await uploadImage(profilePicPath, "group_profile_pictures");
            // Delete the file asynchronously
            deleteFile(profilePicPath);
        }
        // Upload cover picture if available
        if (files["coverPic"]?.[0]) {
            const coverPicPath = files["coverPic"][0].path;
            coverPicUrl = await uploadImage(coverPicPath, "group_cover_pictures");
            // Delete the file asynchronously
            deleteFile(coverPicPath);
        }
        // Update the group record
        const updatedGroup = await updateGroupImageService(groupId, profilePicUrl, coverPicUrl);
        res
            .status(200)
            .json({ message: "Image updated successfully", updatedGroup });
    }
    catch (error) {
        console.error("Error updating group images:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
//Fetch group details for members
export const fetchGroupDetailsForMembers = async (req, res) => {
    const userId = req.params.userid;
    try {
        // Fetch group details by userId using GroupService
        const groupDetails = await groupDetilsForMembers(userId);
        if (!groupDetails) {
            res.status(404).json({ message: "Group not found or user is not part of a group." });
            return;
        }
        res.status(200).json(groupDetails);
    }
    catch (error) {
        console.error("Error fetching group details:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
//# sourceMappingURL=group.controller.js.map