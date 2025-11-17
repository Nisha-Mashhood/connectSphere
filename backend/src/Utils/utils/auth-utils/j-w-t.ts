import jwt from 'jsonwebtoken';
import { inject, injectable } from 'inversify';
import { Response } from 'express';
import config from '../../../config/env-config';
import logger from '../../../core/utils/logger';
import { ServiceError } from '../../../core/utils/error-handler';
import { IUserRepository } from '../../../Interfaces/Repository/i-user-repositry';
import { IJWTService } from '../../../Interfaces/Services/i-jwt-service';

interface JwtPayload {
  [key: string]: any;
}

@injectable()
export class JWTServiceClass implements IJWTService{
  private userRepo: IUserRepository;

  constructor(@inject('IUserRepository') userRepository : IUserRepository) {
    this.userRepo = userRepository;
  }

  public generateAccessToken = (payload: JwtPayload, expiresIn: string = '1h'): string => {
    if (!config.jwtSecret) {
      logger.error('JWT secret is not defined');
      throw new ServiceError('JWT secret is not defined');
    }
    if (typeof payload !== 'object' || payload === null) {
      logger.error('Payload must be a plain object');
      throw new ServiceError('Payload must be a plain object');
    }
    try {
      const token = jwt.sign(payload, config.jwtSecret, { expiresIn });
      logger.debug(`Generated access token for payload: ${JSON.stringify(payload)}`);
      return token;
    } catch (error: any) {
      logger.error(`Failed to generate access token: ${error.message}`);
      throw new ServiceError(`Failed to generate access token: ${error.message}`);
    }
  }

  public verifyAccessToken = (token: string): JwtPayload => {
    logger.info(`Token Received : ${token}`);
    if (!config.jwtSecret) {
      logger.error('JWT secret is not defined');
      throw new ServiceError('JWT secret is not defined');
    }
    try {
      const payload = jwt.verify(token, config.jwtSecret) as JwtPayload;
      logger.info(`Payload after verification : ${payload}`);
      if(!payload){
        throw new ServiceError('Payload for JWT not verified');
      }
      logger.debug(`Verified access token: ${token}`);
      return payload;
    } catch (error) {
      logger.info(error);
      logger.error(`Invalid or expired access token: ${token}`);
      throw new ServiceError('Invalid or expired access token');
    }
  }

  public generateRefreshToken = (payload: JwtPayload): string => {
    if (!config.jwtSecret) {
      logger.error('JWT secret is not defined');
      throw new ServiceError('JWT secret is not defined');
    }
    if (typeof payload !== 'object' || payload === null) {
      logger.error('Payload must be a plain object');
      throw new ServiceError('Payload must be a plain object');
    }
    try {
      const token = jwt.sign(payload, config.jwtSecret, { expiresIn: '7d' });
      logger.debug(`Generated refresh token for payload: ${JSON.stringify(payload)}`);
      return token;
    } catch (error: any) {
      logger.error(`Failed to generate refresh token: ${error.message}`);
      throw new ServiceError(`Failed to generate refresh token: ${error.message}`);
    }
  }

  public verifyRefreshToken = (token: string): JwtPayload => {
    if (!config.jwtSecret) {
      logger.error('JWT secret is not defined');
      throw new ServiceError('JWT secret is not defined');
    }
    try {
      const payload = jwt.verify(token, config.jwtSecret) as JwtPayload;
      logger.debug(`Verified refresh token: ${token}`);
      return payload;
    } catch (error) {
      logger.info(error);
      logger.error(`Invalid or expired refresh token: ${token}`);
      throw new ServiceError('Invalid or expired refresh token');
    }
  }

  public setTokensInCookies = (res: Response, accessToken: string, refreshToken: string): void => {
    const isProduction = config.node_env === 'production';
    try {
      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        maxAge: 60 * 60 * 1000, // 1 hour
      });
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });
      logger.debug('Set accessToken and refreshToken in cookies');
    } catch (error: any) {
      logger.error(`Failed to set tokens in cookies: ${error.message}`);
      throw new ServiceError(`Failed to set tokens in cookies: ${error.message}`);
    }
  }

  public clearCookies = (res: Response): void => {
    try {
      res.clearCookie('accessToken', { httpOnly: true, sameSite: 'strict' });
      res.clearCookie('refreshToken', { httpOnly: true, sameSite: 'strict' });
      logger.debug('Cleared accessToken and refreshToken cookies');
    } catch (error: any) {
      logger.error(`Failed to clear cookies: ${error.message}`);
      throw new ServiceError(`Failed to clear cookies: ${error.message}`);
    }
  }

  public removeRefreshToken = async(userEmail: string): Promise<{ message: string }> => {
    try {
      const user = await this.userRepo.findUserByEmail(userEmail);
      if (!user) {
        logger.error(`User not found for email: ${userEmail}`);
        throw new ServiceError('User not found');
      }
      await this.userRepo.removeRefreshToken(userEmail);
      logger.info(`Refresh token removed for user: ${userEmail}`);
      return { message: 'Refresh token removed successfully' };
    } catch (error: any) {
      logger.error(`Error removing refresh token for user ${userEmail}: ${error.message}`);
      throw new ServiceError(`Error removing refresh token: ${error.message}`);
    }
  }
}