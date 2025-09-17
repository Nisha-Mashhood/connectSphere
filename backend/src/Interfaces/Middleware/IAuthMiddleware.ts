import { Request, Response, NextFunction } from 'express';

export interface IAuthMiddleware {
  verifyToken(req: Request, res: Response, next: NextFunction): Promise<void>;
  verifyRefreshToken(req: Request, res: Response, next: NextFunction): Promise<void>;
  checkBlockedStatus(req: Request, res: Response, next: NextFunction): Promise<void>;
  authorize(...allowedRoles: string[]): (req: Request, res: Response, next: NextFunction) => void;
}