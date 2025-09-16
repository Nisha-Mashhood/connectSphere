import { NextFunction, Request, Response } from "express";

export interface IContactController {
  getUserContacts(req: Request, res: Response, next:NextFunction): Promise<void>;
}
