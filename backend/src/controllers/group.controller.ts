import { Request, Response } from "express";
import {
  createGroupService,
  deleteGroupByIdService,
  fetchAllGroupRequests,
  // fetchAllGroups,
  fetchGroupDetails,
  // fetchGroupDetailsById,
  fetchGroupDetailsService,
  fetchGroupRequestById,
  fetchGroupRequestsByAdminId,
  fetchGroupRequestsByGroupId,
  fetchGroupRequestsByuserId,
  fetchGroups,
  groupDetilsForMembers,
  modifyGroupRequestStatus,
  processGroupPaymentService,
  removeMemberFromGroup,
  requestToJoinGroup,
  updateGroupImageService,
} from "../services/group.service.js";
import { findRequestById } from "../repositories/group.repositry.js";
import { uploadMedia } from "../utils/cloudinary.utils.js";
export const createGroup = async (req: Request, res: Response) => {
  try {
    const groupData = req.body;
    const createdGroup = await createGroupService(groupData);

    res.status(201).json({
      success: true,
      message: "Group created successfully",
      data: createdGroup,
    });
  } catch (error: any) {
    console.error("Error in createGroupController:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

export const getGroupDetails = async (req: Request, res: Response) => {
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
  } catch (error: any) {
    res.status(500).json({ message: error.message });
    return;
  }
};

export const getGroupDetailsByGroupId = async (req: Request, res: Response) => {
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
  } catch (error: any) {
    res.status(500).json({ message: error.message });
    return;
  }
};

export const getGroups = async (_req: Request, res: Response) => {
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
  } catch (error: any) {
    res.status(500).json({ message: error.message });
    return;
  }
};

export const sendGroupRequset = async (req: Request, res: Response) => {
  const { groupId, userId } = req.body;
  try {
    const requsetDeatils = await requestToJoinGroup(groupId, userId);
    res
      .status(201)
      .json({ message: "Requset send successfully", data: requsetDeatils });
    return;
  } catch (error: any) {
    res.status(500).json({ message: error.message });
    return;
  }
};

export const getrequsetDeatilsbyGroupId = async (
  req: Request,
  res: Response
) => {
  const { groupId } = req.params;
  try {
    const requsetDeatils = await fetchGroupRequestsByGroupId(groupId);
    res
      .status(201)
      .json({ message: "Requset accessed successfully", data: requsetDeatils });
    return;
  } catch (error: any) {
    res.status(500).json({ message: error.message });
    return;
  }
};

export const getrequsetDeatilsbyAdminId = async (
  req: Request,
  res: Response
) => {
  const { adminId } = req.params;
  try {
    const requsetDeatils = await fetchGroupRequestsByAdminId(adminId);
    res
      .status(201)
      .json({ message: "Requset accessed successfully", data: requsetDeatils });
    return;
  } catch (error: any) {
    res.status(500).json({ message: error.message });
    return;
  }
};

export const getrequsetDeatilsbyUserId = async (
  req: Request,
  res: Response
) => {
  const { userId } = req.params;
  try {
    const requsetDeatils = await fetchGroupRequestsByuserId(userId);
    res
      .status(201)
      .json({ message: "Requset accessed successfully", data: requsetDeatils });
    return;
  } catch (error: any) {
    res.status(500).json({ message: error.message });
    return;
  }
};

export const updaterequsetDeatils = async (req: Request, res: Response) => {
  const { requestId, status } = req.body;
  try {
    const requsetDeatils = await modifyGroupRequestStatus(requestId, status);
    res
      .status(201)
      .json({ message: "Requset updated successfully", data: requsetDeatils });
    return;
  } catch (error: any) {
    res.status(500).json({ message: error.message });
    return;
  }
};

//Make payemnt requset
export const makeStripePaymentController = async (req: Request, res: Response) => {
  const { paymentMethodId, amount, requestId, email, groupRequestData, returnUrl } = req.body;
  console.log("Payment request received:", req.body);

  try {
    // Validate input
    if (!paymentMethodId || !amount || !requestId || !email || !groupRequestData || !returnUrl) {
       res.status(400).json({
        status: "failure",
        message: "Missing required payment information"
      });
      return
    }

    // Retrieve the group request document
    const groupRequest = await findRequestById(requestId);
    if (!groupRequest) {
      res.status(404).json({
        status: "failure",
        message: "Group request not found"
      });
      return
    }

    // Process payment and handle members in group collection
    const paymentResult = await processGroupPaymentService(
      paymentMethodId,
      amount,
      requestId,
      email,
      groupRequestData,
      returnUrl
    );

    // Handle different payment intent statuses
    if (paymentResult.status === "requires_action" && paymentResult.next_action) {
      // Payment requires additional action (like 3D Secure)
      res.status(200).json({ 
        status: "requires_action", 
        charge: paymentResult 
      });
      return;
    } else if (paymentResult.status === "succeeded") {
      // Payment succeeded
      res.status(200).json({ status: "success", charge: paymentResult });
      return;
    } else {
      // Payment failed or is pending
      res.status(200).json({ 
        status: "pending", 
        charge: paymentResult,
        message: `Payment status: ${paymentResult.status}` 
      });
      return;
    }
    
  } catch (error: any) {
    console.error("Payment processing error:", error.message);
    res.status(500).json({
      status: "failure",
      error: error.message || "An error occurred during payment processing"
    });
    return
  }
};

export const removeGroupMember = async (req: Request, res: Response) => {
  const { groupId, userId } = req.body;
  try {
    const response = await removeMemberFromGroup(groupId, userId);
    res.status(200).json({ status: "success", response });
  } catch (error: any) {
    console.error("Error:", error.message);
    res.status(500).json({ status: "failure", error: error.message });
  }
};

export const deleteGroup = async (req: Request, res: Response) => {
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
  } catch (error: any) {
    console.error("Error:", error.message);
    res.status(500).json({ status: "failure", error: error.message });
  }
};

//Update the profile picture and cover picture for the group
export const updateGroupImage = async (req: Request, res: Response) => {

  console.log(req.body);
  try {
    const { groupId } = req.params;
    const files = req.files as
      | { [fieldname: string]: Express.Multer.File[] }
      | undefined;

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

    let profilePicUrl: string | undefined;
    let coverPicUrl: string | undefined;

    // Upload profile picture if available
    if (files["profilePic"]?.[0]) {
      const profilePicPath = files["profilePic"][0].path;
      const { url } = await uploadMedia(profilePicPath, "group_profile_pictures", profilePic.size);
      profilePicUrl = url;
    }

    // Upload cover picture if available
    if (files["coverPic"]?.[0]) {
      const coverPicPath = files["coverPic"][0].path;
      const { url } = await uploadMedia(coverPicPath, "group_cover_pictures", coverPic.size);
      coverPicUrl = url;
    }

    // Update the group record
    const updatedGroup = await updateGroupImageService(
      groupId,
      profilePicUrl,
      coverPicUrl
    );

    res
      .status(200)
      .json({ message: "Image updated successfully", updatedGroup });
  } catch (error) {
    console.error("Error updating group images:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

//Fetch group details for members
export const fetchGroupDetailsForMembers = async (req: Request, res: Response) => {
  const userId = req.params.userid;

  try {
    // Fetch group details by userId using GroupService
    const groupDetails = await groupDetilsForMembers(userId);

    if (!groupDetails) {
      res.status(404).json({ message: "Group not found or user is not part of a group." });
      return 
    }

    res.status(200).json(groupDetails);
  } catch (error) {
    console.error("Error fetching group details:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get all group requests
export const getAllGroupRequestsController = async (_req: Request, res: Response) => {
  try {
    const groupRequests = await fetchAllGroupRequests();
    res.status(200).json(groupRequests);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Get group request details by request ID
export const getGroupRequestByIdController = async (req: Request, res: Response) => {
  try {
    const requestId = req.params.requestId;
    const requestDetails = await fetchGroupRequestById(requestId);
    if (!requestDetails) {
      res.status(404).json({ message: "Group request not found" });
      return 
    }
    res.status(200).json(requestDetails);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};