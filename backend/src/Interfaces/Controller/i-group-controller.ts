import { NextFunction, Request, Response } from "express";

export interface IGroupController {
  createGroup(req: Request, res: Response, next:NextFunction): Promise<void>;
  getGroupDetails(req: Request, res: Response, next:NextFunction): Promise<void>;
  getGroupById(req: Request, res: Response, next:NextFunction): Promise<void>;
  getAllGroups(req: Request, res: Response, next:NextFunction): Promise<void>;
  sendGroupRequest(req: Request, res: Response, next:NextFunction): Promise<void>;
  getGroupRequestsByGroupId(req: Request, res: Response, next:NextFunction): Promise<void>;
  getGroupRequestsByAdminId(req: Request, res: Response, next:NextFunction): Promise<void>;
  getGroupRequestsByUserId(req: Request, res: Response, next:NextFunction): Promise<void>;
  updateGroupRequest(req: Request, res: Response, next:NextFunction): Promise<void>;
  makeStripePayment(req: Request, res: Response, next:NextFunction): Promise<void>;
  removeGroupMember(req: Request, res: Response, next:NextFunction): Promise<void>;
  deleteGroup(req: Request, res: Response, next:NextFunction): Promise<void>;
  updateGroupImage(req: Request, res: Response, next:NextFunction): Promise<void>;
  getGroupDetailsForMembers(req: Request, res: Response, next:NextFunction): Promise<void>;
  getAllGroupRequests(req: Request, res: Response, next:NextFunction): Promise<void>;
  getGroupRequestById(req: Request, res: Response, next:NextFunction): Promise<void>;
}
