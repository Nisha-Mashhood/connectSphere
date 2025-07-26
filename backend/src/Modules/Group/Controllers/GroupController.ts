import { Request, Response } from 'express';
import { GroupService } from '../Service/Groupservice';
import { uploadMedia } from '../../../core/Utils/Cloudinary';
import { ServiceError } from '../../../core/Utils/ErrorHandler';
import logger from '../../../core/Utils/Logger';
import { GroupFormData } from '../Types/types';

export class GroupController {
  private groupService: GroupService;

  constructor() {
    this.groupService = new GroupService();
  }

    createGroup  = async(req: Request, res: Response): Promise<void> =>{
    try {
      logger.debug('Creating group');
      const groupData: GroupFormData = req.body;
      const createdGroup = await this.groupService.createGroup(groupData);
      res.status(201).json({
        success: true,
        message: 'Group created successfully',
        data: createdGroup,
      });
    } catch (error: any) {
      logger.error(`Error in createGroup: ${error.message}`);
      res.status(500).json({
        success: false,
        message: error.message || 'Internal server error',
      });
    }
  }

    getGroupDetails  = async(req: Request, res: Response): Promise<void> =>{
    try {
      const { adminId } = req.params;
      logger.debug(`Fetching groups for admin: ${adminId}`);
      const groups = await this.groupService.getGroupDetails(adminId);
      logger.info("groups Fetched : ",groups);
      res.status(200).json({
        success: true,
        message: groups.length === 0 ? 'No groups found for this admin' : 'Groups fetched successfully',
        data: groups,
      });
    } catch (error: any) {
      logger.error(`Error in getGroupDetails: ${error.message}`);
      res.status(500).json({ success: false, message: error.message });
    }
  }

    getGroupById  = async(req: Request, res: Response): Promise<void> =>{
    try {
      const { groupId } = req.params;
      logger.debug(`Fetching group by ID: ${groupId}`);
      const group = await this.groupService.getGroupById(groupId);
      if (!group) {
       res.status(200).json({
          success: true,
          message: "No groups found",
        });
        return;
      }
      res.status(200).json({
        success: true,
        message: 'Group fetched successfully',
        data: group,
      });
    } catch (error: any) {
      logger.error(`Error in getGroupById: ${error.message}`);
      res.status(500).json({ success: false, message: error.message });
    }
  }

    getAllGroups = async (req: Request, res: Response): Promise<void> => {
    try {
      const { search, page, limit } = req.query;
      const query: any = {};
      
      if (search) query.search = search as string;
      if (page) query.page = parseInt(page as string, 10);
      if (limit) query.limit = parseInt(limit as string, 10);

      logger.debug(`Fetching groups with query: ${JSON.stringify(query)}`);
      const result = await this.groupService.getAllGroups(query);

      // If no groups found, return 200 with empty array and message
      if (result.groups.length === 0) {
        res.status(200).json({
          success: true,
          message: "No groups found",
          data: {
            groups: [],
            total: 0,
            page: query.page || 1,
            limit: query.limit || 10,
          },
        });
        return;
      }

      // If no query parameters, return all groups 
      if (!search && !page && !limit) {
        res.status(200).json({
          success: true,
          message: "Groups fetched successfully",
          data: result.groups,
        });
      } else {
        res.status(200).json({
          success: true,
          message: "Groups fetched successfully",
          data: {
            groups: result.groups,
            total: result.total,
            page: query.page || 1,
            limit: query.limit || 10,
          },
        });
      }
    } catch (error: any) {
      logger.error(`Error in getAllGroups: ${error.message}`);
      res.status(500).json({ success: false, message: `Server error: ${error.message}` });
    }
  }

    sendGroupRequest  = async(req: Request, res: Response): Promise<void> =>{
    try {
      const { groupId, userId } = req.body;
      logger.debug(`Sending group request for group: ${groupId}, user: ${userId}`);
      const request = await this.groupService.requestToJoinGroup(groupId, userId);
      res.status(201).json({
        success: true,
        message: 'Request sent successfully',
        data: request,
      });
    } catch (error: any) {
      logger.error(`Error in sendGroupRequest: ${error.message}`);
      res.status(500).json({ success: false, message: error.message });
    }
  }

    getGroupRequestsByGroupId  = async(req: Request, res: Response): Promise<void> =>{
    try {
      const { groupId } = req.params;
      logger.debug(`Fetching group requests for group: ${groupId}`);
      const requests = await this.groupService.getGroupRequestsByGroupId(groupId);
      res.status(200).json({
        success: true,
        message: requests.length === 0 ? 'No group requests found for this group' : 'Requests accessed successfully',
        data: requests,
      });
    } catch (error: any) {
      logger.error(`Error in getGroupRequestsByGroupId: ${error.message}`);
      res.status(500).json({ success: false, message: error.message });
    }
  }

    getGroupRequestsByAdminId  = async(req: Request, res: Response): Promise<void> =>{
    try {
      const { adminId } = req.params;
      logger.debug(`Fetching group requests for admin: ${adminId}`);
      const requests = await this.groupService.getGroupRequestsByAdminId(adminId);
      res.status(200).json({
        success: true,
        message: requests.length === 0 ? 'No group requests found for this Admin' : 'Requests accessed successfully',
        data: requests,
      });
    } catch (error: any) {
      logger.error(`Error in getGroupRequestsByAdminId: ${error.message}`);
      res.status(500).json({ success: false, message: error.message });
    }
  }

    getGroupRequestsByUserId  = async(req: Request, res: Response): Promise<void> =>{
    try {
      const { userId } = req.params;
      logger.debug(`Fetching group requests for user: ${userId}`);
      const requests = await this.groupService.getGroupRequestsByUserId(userId);
      res.status(200).json({
        success: true,
        message: requests.length === 0 ? 'No group requests found for this user' : 'Requests accessed successfully',
        data: requests,
      });
    } catch (error: any) {
      logger.error(`Error in getGroupRequestsByUserId: ${error.message}`);
      res.status(500).json({ success: false, message: error.message });
    }
  }

    updateGroupRequest  = async(req: Request, res: Response): Promise<void> =>{
    try {
      const { requestId, status } = req.body;
      logger.debug(`Updating group request: ${requestId} to ${status} :- Controller`);
      const result = await this.groupService.modifyGroupRequestStatus(requestId, status);
      res.status(200).json({
        success: true,
        message: result.message,
        data: result,
      });
    } catch (error: any) {
      logger.error(`Error in updateGroupRequest: ${error.message}`);
      res.status(500).json({ success: false, message: error.message });
    }
  }

    makeStripePayment  = async(req: Request, res: Response): Promise<void> =>{
    try {
      const { paymentMethodId, amount, requestId, email, groupRequestData, returnUrl } = req.body;
      logger.debug(`Processing payment for group request: ${requestId}`);
      if (!paymentMethodId || !amount || !requestId || !email || !groupRequestData || !returnUrl) {
        res.status(400).json({
          success: false,
          message: 'Missing required payment information',
        });
        return;
      }
      const { paymentIntent } = await this.groupService.processGroupPayment(
        paymentMethodId,
        amount,
        requestId,
        email,
        groupRequestData,
        returnUrl
      );
      if (paymentIntent.status === 'requires_action' && paymentIntent.next_action) {
        res.status(200).json({ success: true, status: 'requires_action', charge: paymentIntent });
      } else if (paymentIntent.status === 'succeeded') {
        res.status(200).json({ success: true, status: 'success', charge: paymentIntent });
      } else {
        res.status(200).json({
          success: true,
          status: 'pending',
          charge: paymentIntent,
          message: `Payment status: ${paymentIntent.status}`,
        });
      }
    } catch (error: any) {
      logger.error(`Error in makeStripePayment: ${error.message}`);
      res.status(500).json({ success: false, message: error.message });
    }
  }

    removeGroupMember  = async(req: Request, res: Response): Promise<void> =>{
    try {
      const { groupId, userId } = req.body;
      logger.debug(`Removing user ${userId} from group ${groupId}`);
      const response = await this.groupService.removeGroupMember(groupId, userId);
      res.status(200).json({
        success: true,
        message: 'Member removed successfully',
        data: response,
      });
    } catch (error: any) {
      logger.error(`Error in removeGroupMember: ${error.message}`);
      res.status(500).json({ success: false, message: error.message });
    }
  }

    deleteGroup  = async(req: Request, res: Response): Promise<void> =>{
    try {
      const { groupId } = req.params;
      logger.debug(`Deleting group: ${groupId}`);
      const response = await this.groupService.deleteGroup(groupId);
      res.status(200).json({
        success: true,
        message: 'Group deleted successfully',
        data: response,
      });
    } catch (error: any) {
      logger.error(`Error in deleteGroup: ${error.message}`);
      res.status(500).json({ success: false, message: error.message });
    }
  }

    updateGroupImage  = async(req: Request, res: Response): Promise<void> =>{
    try {
      const { groupId } = req.params;
      logger.debug(`Updating group image for group: ${groupId}`);
      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      if (!files || Object.keys(files).length === 0) {
        throw new ServiceError('No file uploaded');
      }
      const profilePic = files['profilePic']?.[0];
      const coverPic = files['coverPic']?.[0];
      if (!profilePic && !coverPic) {
        throw new ServiceError('Invalid file upload');
      }
      let profilePicUrl: string | undefined;
      let coverPicUrl: string | undefined;
      if (profilePic) {
        const { url } = await uploadMedia(profilePic.path, 'group_profile_pictures', profilePic.size);
        profilePicUrl = url;
      }
      if (coverPic) {
        const { url } = await uploadMedia(coverPic.path, 'group_cover_pictures', coverPic.size);
        coverPicUrl = url;
      }
      const updatedGroup = await this.groupService.updateGroupImage(groupId, profilePicUrl, coverPicUrl);
      if (!updatedGroup) {
        throw new ServiceError('Failed to update group image');
      }
      res.status(200).json({
        success: true,
        message: 'Image updated successfully',
        data: updatedGroup,
      });
    } catch (error: any) {
      logger.error(`Error in updateGroupImage: ${error.message}`);
      res.status(500).json({ success: false, message: error.message });
    }
  }

    getGroupDetailsForMembers  = async(req: Request, res: Response): Promise<void> =>{
    try {
      const { userid } = req.params;
      logger.debug(`Fetching group details for member: ${userid}`);
      const groups = await this.groupService.getGroupDetailsForMembers(userid);
      if (!groups) {
        res.status(200).json({
          success: true,
          message: "No groups found",
          data: {
            groups: [],
          },
        });
        return;
      }
      res.status(200).json({
        success: true,
        message: groups.length === 0 ? 'No groups found for this user' : 'Group details fetched successfully',
        data: groups,
      });
    } catch (error: any) {
      logger.error(`Error in getGroupDetailsForMembers: ${error.message}`);
      res.status(500).json({ success: false, message: error.message });
    }
  }

    getAllGroupRequests = async(_req: Request, res: Response): Promise<void> =>{
    try {
      logger.debug('Fetching all group requests');
      const requests = await this.groupService.getAllGroupRequests();
      res.status(200).json({
        success: true,
        message: requests.length === 0 ? 'No group requests found' : 'Group requests fetched successfully',
        data: requests,
      });
    } catch (error: any) {
      logger.error(`Error in getAllGroupRequests: ${error.message}`);
      res.status(500).json({ success: false, message: error.message });
    }
  }

    getGroupRequestById  = async(req: Request, res: Response): Promise<void> =>{
    try {
      const { requestId } = req.params;
      logger.debug(`Fetching group request by ID: ${requestId}`);
      const request = await this.groupService.getGroupRequestById(requestId);
      if (!request) {
        res.status(200).json({ success: true, message: 'Group request not found' });
        return;
      }
      res.status(200).json({
        success: true,
        message: 'Group request fetched successfully',
        data: request,
      });
    } catch (error: any) {
      logger.error(`Error in getGroupRequestById: ${error.message}`);
      res.status(500).json({ success: false, message: error.message });
    }
  }
}