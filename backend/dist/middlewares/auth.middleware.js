import logger from '../core/Utils/Logger.js';
import { ServiceError } from '../core/Utils/ErrorHandler.js';
import { AuthService as JWTService } from '../Modules/Auth/Utils/JWT.js';
import { UserRepository } from '../Modules/Auth/Repositry/UserRepositry.js';
export class AuthMiddleware {
    jwtService;
    userRepo;
    constructor() {
        this.jwtService = new JWTService();
        this.userRepo = new UserRepository();
    }
    verifyToken = async (req, _res, next) => {
        const accessToken = req.cookies.accessToken;
        logger.info(`Access Token: ${accessToken}`);
        if (!accessToken) {
            logger.warn('Access token not found in request');
            throw new ServiceError('Access token not found');
        }
        try {
            const decoded = this.jwtService.verifyAccessToken(accessToken);
            logger.info(`Decoded Info: ${JSON.stringify(decoded)}`);
            const user = await this.userRepo.getUserById(decoded.userId);
            logger.debug(`Current user: ${user?._id}`);
            if (!user) {
                logger.warn(`User not found for ID: ${decoded.userId}`);
                throw new ServiceError('User not found');
            }
            req.currentUser = user;
            next();
        }
        catch (error) {
            logger.error(`Token verification failed: ${error.message}`);
            throw new ServiceError('Invalid or expired token');
        }
    };
    verifyRefreshToken = async (req, _res, next) => {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            logger.warn('Refresh token not found in request');
            throw new ServiceError('Refresh token not found');
        }
        try {
            const decoded = this.jwtService.verifyRefreshToken(refreshToken);
            const user = await this.userRepo.getUserById(decoded.userId);
            if (!user || user.refreshToken !== refreshToken) {
                logger.warn(`Invalid refresh token for user ID: ${decoded.userId}`);
                throw new ServiceError('Invalid refresh token');
            }
            req.currentUser = user;
            next();
        }
        catch (error) {
            logger.error(`Refresh token verification failed: ${error.message}`);
            throw new ServiceError('Invalid or expired refresh token');
        }
    };
    checkBlockedStatus = async (req, _res, next) => {
        if (req.currentUser?.isBlocked) {
            logger.warn(`Blocked user attempted access: ${req.currentUser._id}`);
            throw new ServiceError('Your account has been blocked. Please contact support.');
        }
        next();
    };
    authorize = (...allowedRoles) => {
        return (req, _res, next) => {
            if (!req.currentUser) {
                logger.warn('Authentication required for protected route');
                throw new ServiceError('Authentication required');
            }
            const userRole = req.currentUser.role ?? '';
            if (!allowedRoles.includes(userRole)) {
                logger.warn(`Access forbidden for user ${req.currentUser._id} with role ${userRole}`);
                throw new ServiceError('Access forbidden');
            }
            logger.debug(`Authorized user ${req.currentUser._id} with role ${userRole}`);
            next();
        };
    };
}
//# sourceMappingURL=auth.middleware.js.map