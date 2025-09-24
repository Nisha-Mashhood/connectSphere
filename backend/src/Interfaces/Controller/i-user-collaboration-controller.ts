import { NextFunction, Request, Response } from "express";

export interface IUserConnectionController {
  sendRequest(req: Request, res: Response, next:NextFunction): Promise<void>;
  respondToRequest(req: Request, res: Response, next:NextFunction): Promise<void>;
  disconnectConnection(req: Request, res: Response, next:NextFunction): Promise<void>;
  getUserConnections(req: Request, res: Response, next:NextFunction): Promise<void>;
  getUserRequests(req: Request, res: Response, next:NextFunction): Promise<void>;
  getAllUserConnections(req: Request, res: Response, next:NextFunction): Promise<void>;
  getUserConnectionById(req: Request, res: Response, next:NextFunction): Promise<void>;
}
