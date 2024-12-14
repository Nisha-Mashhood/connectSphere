import jwt from 'jsonwebtoken';
import config from '../config/env.config.js';
import { findUserById, removeRefreshToken as removeRefreshTokenRepositry } from '../repositories/user.repositry.js';
// Generate JWT Access token (short-lived, 1 hour)
export const generateAccessToken = (payload, expiresIn = '1h') => {
    if (!config.jwtSecret) {
        throw new Error('JWT secret is not defined!');
    }
    // Ensure payload is an object
    if (typeof payload !== 'object' || payload === null) {
        throw new Error('Payload must be a plain object');
    }
    return jwt.sign(payload, config.jwtSecret, { expiresIn });
};
// Verify JWT Access token
export const verifyAccessToken = (token) => {
    if (!config.jwtSecret) {
        throw new Error('JWT secret is not defined!');
    }
    try {
        return jwt.verify(token, config.jwtSecret);
    }
    catch (error) {
        throw new Error('Invalid or expired token.');
    }
};
// Generate Refresh Token (long-lived, 7 days)
export const generateRefreshToken = (payload) => {
    if (!config.jwtSecret) {
        throw new Error('JWT secret is not defined!');
    }
    if (typeof payload !== 'object' || payload === null) {
        throw new Error('Payload must be a plain object');
    }
    return jwt.sign(payload, config.jwtSecret, { expiresIn: '7d' });
};
// Verify JWT Refresh Token
export const verifyRefreshToken = (token) => {
    if (!config.jwtSecret) {
        throw new Error('JWT secret is not defined!');
    }
    try {
        return jwt.verify(token, config.jwtSecret);
    }
    catch (error) {
        throw new Error('Invalid or expired refresh token.');
    }
};
// Function to handle token removal during logout
export const removeRefreshToken = async (userId) => {
    try {
        // Find the user by their ID
        const user = await findUserById(userId);
        if (!user) {
            throw new Error('User not found');
        }
        await removeRefreshTokenRepositry(userId);
        return { message: 'Refresh token removed successfully' };
    }
    catch (error) {
        throw new Error('Error removing refresh token: ' + error.message);
    }
};
//# sourceMappingURL=jwt.utils.js.map