import { NextFunction, Request, Response } from "express";

export interface ICallController {
  getCallLogsByUserId(req: Request, res: Response, next:NextFunction): Promise<void>;
}
