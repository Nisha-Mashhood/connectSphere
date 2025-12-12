import { Request, Response, NextFunction } from "express";

export interface IChatController {
  getChatMessages(req: Request, res: Response, next: NextFunction): Promise<void>;
  uploadAndSaveMessage(req: Request, res: Response, next: NextFunction): Promise<void>;
  getUnreadMessageCounts(req: Request, res: Response, next: NextFunction): Promise<void>;
  getLastMessageSummaries(req: Request, res: Response, next: NextFunction): Promise<void>;
}
