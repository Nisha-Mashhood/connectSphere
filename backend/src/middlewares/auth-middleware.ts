import { Request, Response, NextFunction } from 'express';
import { inject, injectable } from 'inversify';
import logger from '../core/utils/logger';
import { ServiceError } from '../core/utils/error-handler';
import { IUser } from '../Interfaces/Models/i-user';
import { IJWTService } from '../Interfaces/Services/i-jwt-service';
import { IUserRepository } from '../Interfaces/Repository/i-user-repositry';
import { IAuthMiddleware } from '../Interfaces/Middleware/i-auth-middleware';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      currentUser?: IUser;
    }
  }
}

@injectable()
export class AuthMiddleware implements IAuthMiddleware{
  private _jwtService: IJWTService;
  private _userRepository: IUserRepository;

  constructor(
    @inject('IJWTService') jwtService : IJWTService,
    @inject('IUserRepository') userRepository : IUserRepository,
  ) {
    this._jwtService = jwtService;
    this._userRepository = userRepository;
  }

  public verifyToken = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const accessToken = req.cookies.accessToken;
    logger.info(`Access Token: ${accessToken}`);
    if (!accessToken) {
      logger.warn('Access token not found in request');
      req.currentUser = undefined; 
      return next();
    }
    try {
      const decoded = this._jwtService.verifyAccessToken(accessToken);
      logger.info(`Decoded Info: ${JSON.stringify(decoded)}`);
      const user = await this._userRepository.getUserById(decoded.userId);
      logger.debug(`Current user: ${user?._id}`);
      if (!user) {
        logger.warn(`User not found for ID: ${decoded.userId}`);
        throw new ServiceError('User not found');
      }
      req.currentUser = user;
      next();
    } catch (error: any) {
      logger.error(`Token verification failed: ${error.message}`);
      throw new ServiceError('Invalid or expired token');
    }
  };

  public verifyRefreshToken = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      logger.warn('Refresh token not found in request');
      throw new ServiceError('Refresh token not found');
    }
    try {
      const decoded = this._jwtService.verifyRefreshToken(refreshToken);
      const user = await this._userRepository.getUserById(decoded.userId);
      if (!user || user.refreshToken !== refreshToken) {
        logger.warn(`Invalid refresh token for user ID: ${decoded.userId}`);
        throw new ServiceError('Invalid refresh token');
      }
      req.currentUser = user;
      next();
    } catch (error: any) {
      logger.error(`Refresh token verification failed: ${error.message}`);
      throw new ServiceError('Invalid or expired refresh token');
    }
  };

  public checkBlockedStatus = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    if (req.currentUser?.isBlocked) {
      logger.warn(`Blocked user attempted access: ${req.currentUser._id}`);
      throw new ServiceError('Your account has been blocked. Please contact support.');
    }
    next();
  };

  public authorize = (...allowedRoles: string[]) => {
    return (req: Request, _res: Response, next: NextFunction) => {
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