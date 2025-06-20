import jwt from 'jsonwebtoken';
import config from '../../../config/env.config.js';
import logger from '../../../core/Utils/Logger.js';
import { ServiceError } from '../../../core/Utils/ErrorHandler.js';
import { UserRepository } from '../Repositry/UserRepositry.js';
export class AuthService {
    userRepo;
    constructor() {
        this.userRepo = new UserRepository();
    }
    generateAccessToken = (payload, expiresIn = '1h') => {
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
        }
        catch (error) {
            logger.error(`Failed to generate access token: ${error.message}`);
            throw new ServiceError(`Failed to generate access token: ${error.message}`);
        }
    };
    verifyAccessToken = (token) => {
        logger.info(`Token Received : ${token}`);
        if (!config.jwtSecret) {
            logger.error('JWT secret is not defined');
            throw new ServiceError('JWT secret is not defined');
        }
        try {
            const payload = jwt.verify(token, config.jwtSecret);
            logger.info(`Payload after verification : ${payload}`);
            if (!payload) {
                throw new ServiceError('Payload for JWT not verified');
            }
            logger.debug(`Verified access token: ${token}`);
            return payload;
        }
        catch (error) {
            logger.error(`Invalid or expired access token: ${token}`);
            throw new ServiceError('Invalid or expired access token');
        }
    };
    generateRefreshToken = (payload) => {
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
        }
        catch (error) {
            logger.error(`Failed to generate refresh token: ${error.message}`);
            throw new ServiceError(`Failed to generate refresh token: ${error.message}`);
        }
    };
    verifyRefreshToken = (token) => {
        if (!config.jwtSecret) {
            logger.error('JWT secret is not defined');
            throw new ServiceError('JWT secret is not defined');
        }
        try {
            const payload = jwt.verify(token, config.jwtSecret);
            logger.debug(`Verified refresh token: ${token}`);
            return payload;
        }
        catch (error) {
            logger.error(`Invalid or expired refresh token: ${token}`);
            throw new ServiceError('Invalid or expired refresh token');
        }
    };
    setTokensInCookies = (res, accessToken, refreshToken) => {
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
        }
        catch (error) {
            logger.error(`Failed to set tokens in cookies: ${error.message}`);
            throw new ServiceError(`Failed to set tokens in cookies: ${error.message}`);
        }
    };
    clearCookies = (res) => {
        try {
            res.clearCookie('accessToken', { httpOnly: true, sameSite: 'strict' });
            res.clearCookie('refreshToken', { httpOnly: true, sameSite: 'strict' });
            logger.debug('Cleared accessToken and refreshToken cookies');
        }
        catch (error) {
            logger.error(`Failed to clear cookies: ${error.message}`);
            throw new ServiceError(`Failed to clear cookies: ${error.message}`);
        }
    };
    removeRefreshToken = async (userEmail) => {
        try {
            const user = await this.userRepo.findUserByEmail(userEmail);
            if (!user) {
                logger.error(`User not found for email: ${userEmail}`);
                throw new ServiceError('User not found');
            }
            await this.userRepo.removeRefreshToken(userEmail);
            logger.info(`Refresh token removed for user: ${userEmail}`);
            return { message: 'Refresh token removed successfully' };
        }
        catch (error) {
            logger.error(`Error removing refresh token for user ${userEmail}: ${error.message}`);
            throw new ServiceError(`Error removing refresh token: ${error.message}`);
        }
    };
}
//# sourceMappingURL=JWT.js.map