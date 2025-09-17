import { Request, Response, NextFunction } from 'express';
import { inject } from 'inversify';
import { uploadMedia } from '../Core/Utils/Cloudinary';
import { HttpError } from '../Core/Utils/ErrorHandler';
import logger from '../Core/Utils/Logger';
import { GroupFormData } from '../Utils/Types/Group.types';
import type { Express } from "express";
import { IGroupController } from '../Interfaces/Controller/IGroupController';
import { StatusCodes } from "../Enums/StatusCode.enums";
import { BaseController } from '../Core/Controller/BaseController';
import { IGroupService } from '../Interfaces/Services/IGroupService';

export class GroupController extends BaseController implements IGroupController{
  private _groupService: IGroupService;

  constructor(@inject('IGroupService') groupService : IGroupService) {
    super();
    this._groupService = groupService;
  }

    createGroup  = async(req: Request, res: Response, next:NextFunction): Promise<void> =>{
    try {
      logger.debug('Creating group');
      const groupData: GroupFormData = req.body;
      const createdGroup = await this._groupService.createGroup(groupData);
      this.sendCreated(res, { group: createdGroup }, 'Group created successfully');
    } catch (error: any) {
      logger.error(`Error in createGroup: ${error.message}`);
      next(error)
    }
  }

    getGroupDetails  = async(req: Request, res: Response, next:NextFunction): Promise<void> =>{
    try {
      const { adminId } = req.params;
      logger.debug(`Fetching groups for admin: ${adminId}`);
      const groups = await this._groupService.getGroupDetails(adminId);
      logger.info("groups Fetched : ",groups);
      this.sendSuccess(res, { groups }, groups.length === 0 ? 'No groups found for this admin' : 'Groups fetched successfully');
    } catch (error: any) {
      logger.error(`Error in getGroupDetails: ${error.message}`);
      next(error)
    }
  }

    getGroupById  = async(req: Request, res: Response, next:NextFunction): Promise<void> =>{
    try {
      const { groupId } = req.params;
      logger.debug(`Fetching group by ID: ${groupId}`);
      const group = await this._groupService.getGroupById(groupId);
      if (!group) {
        this.sendSuccess(res, {}, 'No group found');
        return;
      }
      this.sendSuccess(res, { group }, 'Group fetched successfully');
    } catch (error: any) {
      logger.error(`Error in getGroupById: ${error.message}`);
      next(error)
    }
  }

    getAllGroups = async (req: Request, res: Response, next:NextFunction): Promise<void> => {
    try {
      const { search, page, limit, excludeAdminId } = req.query;
      const query: any = {};
      
      if (search) query.search = search as string;
      if (page) query.page = parseInt(page as string, 10);
      if (limit) query.limit = parseInt(limit as string, 10);
      if (excludeAdminId) query.excludeAdminId = excludeAdminId as string;

      logger.debug(`Fetching groups with query: ${JSON.stringify(query)}`);
      const result = await this._groupService.getAllGroups(query);

     if (result.groups.length === 0) {
        this.sendSuccess(res, {
          groups: [],
          total: 0,
          page: query.page || 1,
          limit: query.limit || 10,
        }, 'No groups found');
        return;
      }

      const data = !search && !page && !limit
        ? result.groups
        : {
            groups: result.groups,
            total: result.total,
            page: query.page || 1,
            limit: query.limit || 10,
          };

      this.sendSuccess(res, data, 'Groups fetched successfully');
    } catch (error: any) {
      logger.error(`Error in getAllGroups: ${error.message}`);
      next(error)
    }
  }

    sendGroupRequest  = async(req: Request, res: Response, next:NextFunction): Promise<void> =>{
    try {
      const { groupId, userId } = req.body;
      logger.debug(`Sending group request for group: ${groupId}, user: ${userId}`);
      const request = await this._groupService.requestToJoinGroup(groupId, userId);
      this.sendCreated(res, { request }, 'Group request sent successfully');
    } catch (error: any) {
      logger.error(`Error in sendGroupRequest: ${error.message}`);
      next(error)
    }
  }

    getGroupRequestsByGroupId  = async(req: Request, res: Response, next:NextFunction): Promise<void> =>{
    try {
      const { groupId } = req.params;
      logger.debug(`Fetching group requests for group: ${groupId}`);
      const requests = await this._groupService.getGroupRequestsByGroupId(groupId);
      this.sendSuccess(res, { requests }, requests.length === 0 ? 'No group requests found for this group' : 'Requests accessed successfully');
    } catch (error: any) {
      logger.error(`Error in getGroupRequestsByGroupId: ${error.message}`);
      next(error)
    }
  }

    getGroupRequestsByAdminId  = async(req: Request, res: Response, next:NextFunction): Promise<void> =>{
    try {
      const { adminId } = req.params;
      logger.debug(`Fetching group requests for admin: ${adminId}`);
      const requests = await this._groupService.getGroupRequestsByAdminId(adminId);
      this.sendSuccess(res, { requests }, requests.length === 0 ? 'No group requests found for this admin' : 'Requests accessed successfully');
    } catch (error: any) {
      logger.error(`Error in getGroupRequestsByAdminId: ${error.message}`);
      next(error)
    }
  }

    getGroupRequestsByUserId  = async(req: Request, res: Response, next:NextFunction): Promise<void> =>{
    try {
      const { userId } = req.params;
      logger.debug(`Fetching group requests for user: ${userId}`);
      const requests = await this._groupService.getGroupRequestsByUserId(userId);
      this.sendSuccess(res, { requests }, requests.length === 0 ? 'No group requests found for this user' : 'Requests accessed successfully');
    } catch (error: any) {
      logger.error(`Error in getGroupRequestsByUserId: ${error.message}`);
      next(error)
    }
  }

    updateGroupRequest  = async(req: Request, res: Response, next:NextFunction): Promise<void> =>{
    try {
      const { requestId, status } = req.body;
      logger.debug(`Updating group request: ${requestId} to ${status} :- Controller`);
      const result = await this._groupService.modifyGroupRequestStatus(requestId, status);
      this.sendSuccess(res, { result }, result.message);
    } catch (error: any) {
      logger.error(`Error in updateGroupRequest: ${error.message}`);
      next(error)
    }
  }

    makeStripePayment  = async(req: Request, res: Response, next:NextFunction): Promise<void> =>{
    try {
      const { paymentMethodId, amount, requestId, email, groupRequestData, returnUrl } = req.body;
      logger.debug(`Processing payment for group request: ${requestId}`);
      if (!paymentMethodId || !amount || !requestId || !email || !groupRequestData || !returnUrl) {
         throw new HttpError('Missing required payment information', StatusCodes.BAD_REQUEST);
      }
      const { paymentIntent } = await this._groupService.processGroupPayment(
        paymentMethodId,
        amount,
        requestId,
        email,
        groupRequestData,
        returnUrl
      );

      const statusMessage = paymentIntent.status === 'requires_action'
        ? 'requires_action'
        : paymentIntent.status === 'succeeded'
        ? 'success'
        : 'pending';

      this.sendSuccess(res, { paymentIntent }, `Payment processed: ${statusMessage}`);
    } catch (error: any) {
      logger.error(`Error in makeStripePayment: ${error.message}`);
      next(error)
    }
  }

    removeGroupMember  = async(req: Request, res: Response, next:NextFunction): Promise<void> =>{
    try {
      const { groupId, userId } = req.body;
      logger.debug(`Removing user ${userId} from group ${groupId}`);
      const response = await this._groupService.removeGroupMember(groupId, userId);
      this.sendSuccess(res, { response }, 'Member removed successfully');
    } catch (error: any) {
      logger.error(`Error in removeGroupMember: ${error.message}`);
      next(error)
    }
  }

    deleteGroup  = async(req: Request, res: Response, next:NextFunction): Promise<void> =>{
    try {
      const { groupId } = req.params;
      logger.debug(`Deleting group: ${groupId}`);
      const response = await this._groupService.deleteGroup(groupId);
      this.sendSuccess(res, { response }, 'Group deleted successfully');
    } catch (error: any) {
      logger.error(`Error in deleteGroup: ${error.message}`);
      next(error)
    }
  }

    updateGroupImage  = async(req: Request, res: Response, next:NextFunction): Promise<void> =>{
    try {
      const { groupId } = req.params;
      logger.debug(`Updating group image for group: ${groupId}`);
      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      if (!files || Object.keys(files).length === 0) {
        throw new HttpError('No file uploaded', StatusCodes.BAD_REQUEST);
      }
      const profilePic = files['profilePic']?.[0];
      const coverPic = files['coverPic']?.[0];
      if (!profilePic && !coverPic) {
        throw new HttpError('Invalid file upload', StatusCodes.BAD_REQUEST);
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
      const updatedGroup = await this._groupService.updateGroupImage(groupId, profilePicUrl, coverPicUrl);
      if (!updatedGroup) {
        throw new HttpError('Failed to update group image', StatusCodes.BAD_REQUEST);
      }
      this.sendSuccess(res, { updatedGroup }, 'Group image updated successfully');
    } catch (error: any) {
      logger.error(`Error in updateGroupImage: ${error.message}`);
      next(error)
    }
  }

    getGroupDetailsForMembers  = async(req: Request, res: Response, next:NextFunction): Promise<void> =>{
    try {
      const { userid } = req.params;
      logger.debug(`Fetching group details for member: ${userid}`);
      const groups = await this._groupService.getGroupDetailsForMembers(userid);
      this.sendSuccess(res, { groups: groups || [] }, groups.length === 0 ? 'No groups found for this user' : 'Group details fetched successfully');
    } catch (error: any) {
      logger.error(`Error in getGroupDetailsForMembers: ${error.message}`);
      next(error)
    }
  }

    getAllGroupRequests = async(_req: Request, res: Response, next:NextFunction): Promise<void> =>{
    try {
      logger.debug('Fetching all group requests');
      const requests = await this._groupService.getAllGroupRequests();
      this.sendSuccess(res, { requests }, requests.length === 0 ? 'No group requests found' : 'Group requests fetched successfully');
    } catch (error: any) {
      logger.error(`Error in getAllGroupRequests: ${error.message}`);
      next(error)
    }
  }

    getGroupRequestById  = async(req: Request, res: Response, next:NextFunction): Promise<void> =>{
    try {
      const { requestId } = req.params;
      logger.debug(`Fetching group request by ID: ${requestId}`);
      const request = await this._groupService.getGroupRequestById(requestId);
      if (!request) {
        this.sendSuccess(res, {}, 'Group request not found');
        return;
      }
      this.sendSuccess(res, { request }, 'Group request fetched successfully');
    } catch (error: any) {
      logger.error(`Error in getGroupRequestById: ${error.message}`);
      next(error)
    }
  }
}