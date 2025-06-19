import { Request, Response, NextFunction } from 'express';
import { UserInterface } from '../Interfaces/models/IUser.js';
declare global {
    namespace Express {
        interface Request {
            currentUser?: UserInterface;
        }
    }
}
export declare class AuthMiddleware {
    private authService;
    private userRepo;
    constructor();
    verifyToken(req: Request, _res: Response, next: NextFunction): Promise<void>;
    verifyRefreshToken(req: Request, _res: Response, next: NextFunction): Promise<void>;
    checkBlockedStatus(req: Request, _res: Response, next: NextFunction): Promise<void>;
    authorize(...allowedRoles: string[]): (req: Request, _res: Response, next: NextFunction) => void;
}
//# sourceMappingURL=auth.middleware.d.ts.map