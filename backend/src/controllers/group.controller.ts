import { Request, Response } from "express";
import {
  createGroupService,
  fetchGroupDetails,
  fetchGroupRequestsByAdminId,
  fetchGroupRequestsByGroupId,
  fetchGroupRequestsByuserId,
  fetchGroups,
  modifyGroupRequestStatus,
  requestToJoinGroup,
} from "../services/group.service.js";

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

export const sendGroupRequset = async(req:Request, res:Response) =>{
  const { groupId, userId } = req.body;
  try {
    const requsetDeatils = await requestToJoinGroup(groupId, userId)
    res.status(201).json({message:"Requset send successfully",data: requsetDeatils});
    return;
  } catch (error:any) {
    res.status(500).json({ message: error.message });
    return;
  }
}

export const getrequsetDeatilsbyGroupId = async(req:Request, res:Response) =>{
  const { groupId } = req.params;
  try {
    const requsetDeatils = await fetchGroupRequestsByGroupId(groupId)
    res.status(201).json({message:"Requset accessed successfully",data: requsetDeatils});
    return;
  } catch (error:any) {
    res.status(500).json({ message: error.message });
    return;
  }
}

export const getrequsetDeatilsbyAdminId = async(req:Request, res:Response) =>{
  const { adminId } = req.params;
  try {
    const requsetDeatils = await fetchGroupRequestsByAdminId(adminId)
    res.status(201).json({message:"Requset accessed successfully",data: requsetDeatils});
    return;
  } catch (error:any) {
    res.status(500).json({ message: error.message });
    return;
  }
}

export const getrequsetDeatilsbyUserId = async(req:Request, res:Response) =>{
  const { userId } = req.params;
  try {
    const requsetDeatils = await fetchGroupRequestsByuserId(userId)
    res.status(201).json({message:"Requset accessed successfully",data: requsetDeatils});
    return;
  } catch (error:any) {
    res.status(500).json({ message: error.message });
    return;
  }
}

export const updaterequsetDeatils = async(req:Request, res:Response) =>{
  const { requestId, status } = req.body;
  try {
    const requsetDeatils = await modifyGroupRequestStatus(requestId, status)
    res.status(201).json({message:"Requset updated successfully",data: requsetDeatils});
    return;
  } catch (error:any) {
    res.status(500).json({ message: error.message });
    return;
  }
}