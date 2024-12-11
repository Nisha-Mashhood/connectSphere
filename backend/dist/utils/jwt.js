import jwt from 'jsonwebtoken';
import config from '../config/env.js';
// Generate JWT token
export const generateToken = (userId) => {
    if (!config.jwtSecret) {
        throw new Error('JWT secret is not defined!');
    }
    return jwt.sign({ userId }, config.jwtSecret, { expiresIn: '1h' });
};
// Verify JWT token
export const verifyToken = (token) => {
    if (!config.jwtSecret) {
        throw new Error('JWT secret is not defined!');
    }
    return jwt.verify(token, config.jwtSecret);
};
//# sourceMappingURL=jwt.js.map