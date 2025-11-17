import { Request, Response, NextFunction } from 'express';
import { inject, injectable } from 'inversify';
import { uploadMedia } from '../core/utils/cloudinary';
import { HttpError } from '../core/utils/error-handler';
import logger from '../core/utils/logger';
import { GroupFormData } from '../Utils/types/group-types';
import type { Express } from "express";
import { IGroupController } from '../Interfaces/Controller/i-group-controller';
import { StatusCodes } from "../enums/status-code-enums";
import { BaseController } from '../core/controller/base-controller';
import { IGroupService } from '../Interfaces/Services/i-group-service';
import { GROUP_MESSAGES } from '../constants/messages';
import { ERROR_MESSAGES } from '../constants/error-messages';

@injectable()
export class GroupController extends BaseController implements IGroupController{
  private _groupService: IGroupService;

  constructor(@inject('IGroupService') groupService : IGroupService) {
    super();
    this._groupService = groupService;
  }

    createGroup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      logger.debug("Creating group");
      const groupData: GroupFormData = req.body;
      const createdGroup = await this._groupService.createGroup(groupData);
      this.sendCreated(res, { group: createdGroup }, GROUP_MESSAGES.GROUP_CREATED);
    } catch (error: any) {
      logger.error(`Error in createGroup: ${error.message}`);
      next(error);
    }
  };

  getGroupDetails = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { adminId } = req.params;
      logger.debug(`Fetching groups for admin: ${adminId}`);
      const groups = await this._groupService.getGroupDetails(adminId);
      logger.info("groups Fetched : ", groups);
      this.sendSuccess(res, { groups }, groups.length === 0 ? GROUP_MESSAGES.NO_GROUPS_FOUND_FOR_ADMIN : GROUP_MESSAGES.GROUPS_FETCHED);
    } catch (error: any) {
      logger.error(`Error in getGroupDetails: ${error.message}`);
      next(error);
    }
  };

  getGroupById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { groupId } = req.params;
      logger.debug(`Fetching group by ID: ${groupId}`);
      const group = await this._groupService.getGroupById(groupId);
      if (!group) {
        this.sendSuccess(res, {}, GROUP_MESSAGES.NO_GROUPS_FOUND);
        return;
      }
      this.sendSuccess(res, { group }, GROUP_MESSAGES.GROUP_FETCHED);
    } catch (error: any) {
      logger.error(`Error in getGroupById: ${error.message}`);
      next(error);
    }
  };

  getAllGroups = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
        this.sendSuccess(
          res,
          { groups: [], total: 0, page: query.page || 1, limit: query.limit || 10 },
          GROUP_MESSAGES.NO_GROUPS_FOUND
        );
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

      this.sendSuccess(res, data, GROUP_MESSAGES.GROUPS_FETCHED);
    } catch (error: any) {
      logger.error(`Error in getAllGroups: ${error.message}`);
      next(error);
    }
  };

  sendGroupRequest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { groupId, userId } = req.body;
      logger.debug(`Sending group request for group: ${groupId}, user: ${userId}`);
      const request = await this._groupService.requestToJoinGroup(groupId, userId);
      this.sendCreated(res, { request }, GROUP_MESSAGES.GROUP_REQUEST_SENT);
    } catch (error: any) {
      logger.error(`Error in sendGroupRequest: ${error.message}`);
      next(error);
    }
  };

  getGroupRequestsByGroupId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { groupId } = req.params;
      logger.debug(`Fetching group requests for group: ${groupId}`);
      const requests = await this._groupService.getGroupRequestsByGroupId(groupId);
      this.sendSuccess(
        res,
        { requests },
        requests.length === 0 ? GROUP_MESSAGES.NO_GROUP_REQUESTS_FOUND_FOR_GROUP : GROUP_MESSAGES.GROUP_REQUESTS_FETCHED
      );
    } catch (error: any) {
      logger.error(`Error in getGroupRequestsByGroupId: ${error.message}`);
      next(error);
    }
  };

  getGroupRequestsByAdminId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { adminId } = req.params;
      logger.debug(`Fetching group requests for admin: ${adminId}`);
      const requests = await this._groupService.getGroupRequestsByAdminId(adminId);
      this.sendSuccess(
        res,
        { requests },
        requests.length === 0 ? GROUP_MESSAGES.NO_GROUP_REQUESTS_FOUND_FOR_ADMIN : GROUP_MESSAGES.GROUP_REQUESTS_FETCHED
      );
    } catch (error: any) {
      logger.error(`Error in getGroupRequestsByAdminId: ${error.message}`);
      next(error);
    }
  };

  getGroupRequestsByUserId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId } = req.params;
      logger.debug(`Fetching group requests for user: ${userId}`);
      const requests = await this._groupService.getGroupRequestsByUserId(userId);
      this.sendSuccess(
        res,
        { requests },
        requests.length === 0 ? GROUP_MESSAGES.NO_GROUP_REQUESTS_FOUND_FOR_USER : GROUP_MESSAGES.GROUP_REQUESTS_FETCHED
      );
    } catch (error: any) {
      logger.error(`Error in getGroupRequestsByUserId: ${error.message}`);
      next(error);
    }
  };

  updateGroupRequest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { requestId, status } = req.body;
      logger.debug(`Updating group request: ${requestId} to ${status} :- Controller`);
      const result = await this._groupService.modifyGroupRequestStatus(requestId, status);
      this.sendSuccess(res, { result }, GROUP_MESSAGES.GROUP_REQUEST_UPDATED);
    } catch (error: any) {
      logger.error(`Error in updateGroupRequest: ${error.message}`);
      next(error);
    }
  };

  makeStripePayment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { paymentMethodId, amount, requestId, email, groupRequestData, returnUrl } = req.body;
      if (!paymentMethodId || !amount || !requestId || !email || !groupRequestData || !returnUrl) {
        throw new HttpError(ERROR_MESSAGES.MISSING_PAYMENT_INFO, StatusCodes.BAD_REQUEST);
      }
      const { paymentIntent } = await this._groupService.processGroupPayment(
        paymentMethodId,
        amount,
        requestId,
        email,
        groupRequestData,
        returnUrl
      );

      const message =
        paymentIntent.status === "requires_action"
          ? GROUP_MESSAGES.PAYMENT_REQUIRES_ACTION
          : paymentIntent.status === "succeeded"
          ? GROUP_MESSAGES.PAYMENT_PROCESSED_SUCCESS
          : GROUP_MESSAGES.PAYMENT_PROCESSED_PENDING;

      this.sendSuccess(res, { paymentIntent }, message);
    } catch (error: any) {
      logger.error(`Error in makeStripePayment: ${error.message}`);
      next(error);
    }
  };

  removeGroupMember = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { groupId, userId } = req.body;
      logger.debug(`Removing user ${userId} from group ${groupId}`);
      const response = await this._groupService.removeGroupMember(groupId, userId);
      this.sendSuccess(res, { response }, GROUP_MESSAGES.MEMBER_REMOVED);
    } catch (error: any) {
      logger.error(`Error in removeGroupMember: ${error.message}`);
      next(error);
    }
  };

  deleteGroup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { groupId } = req.params;
      logger.debug(`Deleting group: ${groupId}`);
      const response = await this._groupService.deleteGroup(groupId);
      this.sendSuccess(res, { response }, GROUP_MESSAGES.GROUP_DELETED);
    } catch (error: any) {
      logger.error(`Error in deleteGroup: ${error.message}`);
      next(error);
    }
  };

  updateGroupImage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { groupId } = req.params;
      logger.debug(`Updating group image for group: ${groupId}`);
      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      if (!files || Object.keys(files).length === 0) {
        throw new HttpError(ERROR_MESSAGES.NO_FILE_UPLOADED, StatusCodes.BAD_REQUEST);
      }
      const profilePic = files["profilePic"]?.[0];
      const coverPic = files["coverPic"]?.[0];
      if (!profilePic && !coverPic) {
        throw new HttpError(ERROR_MESSAGES.INVALID_FILE_UPLOAD, StatusCodes.BAD_REQUEST);
      }
      let profilePicUrl: string | undefined;
      let coverPicUrl: string | undefined;
      if (profilePic) {
        const { url } = await uploadMedia(profilePic.path, "group_profile_pictures", profilePic.size);
        profilePicUrl = url;
      }
      if (coverPic) {
        const { url } = await uploadMedia(coverPic.path, "group_cover_pictures", coverPic.size);
        coverPicUrl = url;
      }
      const updatedGroup = await this._groupService.updateGroupImage(groupId, profilePicUrl, coverPicUrl);
      if (!updatedGroup) {
        throw new HttpError(ERROR_MESSAGES.FAILED_TO_UPDATE_GROUP_IMAGE, StatusCodes.BAD_REQUEST);
      }
      this.sendSuccess(res, { updatedGroup }, GROUP_MESSAGES.GROUP_IMAGE_UPDATED);
    } catch (error: any) {
      logger.error(`Error in updateGroupImage: ${error.message}`);
      next(error);
    }
  };

  getGroupDetailsForMembers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userid } = req.params;
      logger.debug(`Fetching group details for member: ${userid}`);
      const groups = await this._groupService.getGroupDetailsForMembers(userid);
      this.sendSuccess(
        res,
        { groups: groups || [] },
        groups.length === 0 ? GROUP_MESSAGES.NO_GROUPS_FOUND_FOR_USER : GROUP_MESSAGES.GROUPS_FETCHED
      );
    } catch (error: any) {
      logger.error(`Error in getGroupDetailsForMembers: ${error.message}`);
      next(error);
    }
  };

  getAllGroupRequests = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const search = (req.query.search as string) || "";
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    logger.debug(`Controller: fetching group requests (page=${page}, search="${search}")`);

    const { requests, total } = await this._groupService.getAllGroupRequests(search, page, limit);

    this.sendSuccess(
      res,
      { requests, total, page, limit },
      requests.length === 0
        ? GROUP_MESSAGES.NO_GROUP_REQUESTS_FOUND
        : GROUP_MESSAGES.GROUP_REQUESTS_FETCHED
    );
  } catch (error: any) {
    logger.error(`Error in getAllGroupRequests: ${error.message}`);
    next(error);
  }
};

  getGroupRequestById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { requestId } = req.params;
      logger.debug(`Fetching group request by ID: ${requestId}`);
      const request = await this._groupService.getGroupRequestById(requestId);
      if (!request) {
        this.sendSuccess(res, {}, GROUP_MESSAGES.NO_GROUP_REQUESTS_FOUND);
        return;
      }
      this.sendSuccess(res, { request }, GROUP_MESSAGES.GROUP_REQUEST_FETCHED);
    } catch (error: any) {
      logger.error(`Error in getGroupRequestById: ${error.message}`);
      next(error);
    }
  };
}