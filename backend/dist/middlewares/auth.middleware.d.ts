import { Request, Response, NextFunction } from 'express';
import { UserInterface } from '../models/user.model.js';
declare global {
    namespace Express {
        interface Request {
            currentUser?: UserInterface;
        }
    }
}
export declare const verifyToken: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const verifyRefreshTokenMiddleware: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const checkBlockedStatus: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const authorize: (...allowedRoles: string[]) => (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=auth.middleware.d.ts.map