import { NextFunction, Request, Response } from "express";

export interface IContactMessageController {
  createContactMessage(req: Request, res: Response, next:NextFunction): Promise<void>;
  getAllContactMessages(req: Request, res: Response, next:NextFunction): Promise<void>;
  sendReply(req: Request, res: Response, next:NextFunction): Promise<void>;
}