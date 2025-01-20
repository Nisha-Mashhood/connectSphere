import { verifyAccessToken, verifyRefreshToken } from '../utils/jwt.utils.js';
import { findUserById } from '../repositories/user.repositry.js';
// Verify access token middleware
export const verifyToken = async (req, res, next) => {
    const accessToken = req.cookies.accessToken;
    if (!accessToken) {
        res.status(401).json({ message: "Access token not found" });
        return;
    }
    try {
        const decoded = verifyAccessToken(accessToken);
        const user = await findUserById(decoded.userId);
        // console.log("current user",user);
        if (!user) {
            res.status(401).json({ message: "User not found" });
            return;
        }
        req.currentUser = user;
        next();
    }
    catch (error) {
        res.status(401).json({ message: "Invalid or expired token" });
        return;
    }
};
// Verify refresh token
export const verifyRefreshTokenMiddleware = async (req, res, next) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            res.status(401).json({ message: "Refresh token not found" });
            return;
        }
        const decoded = verifyRefreshToken(refreshToken);
        const user = await findUserById(decoded.userId);
        if (!user || user.refreshToken !== refreshToken) {
            res.status(401).json({ message: "Invalid refresh token" });
            return;
        }
        req.currentUser = user;
        next();
    }
    catch (error) {
        res.status(401).json({ message: "Invalid or expired refresh token" });
        return;
    }
};
// Check if user is blocked
export const checkBlockedStatus = async (req, res, next) => {
    if (req.currentUser?.isBlocked) {
        res.status(403).json({ message: "Your account has been blocked" });
        return;
    }
    next();
};
// Role-based authorization middleware
export const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.currentUser) {
            res.status(401).json({ message: "Authentication required" });
            return;
        }
        const userRole = req.currentUser.role ?? "";
        if (!allowedRoles.includes(userRole)) {
            res.status(403).json({ message: "Access forbidden" });
            return;
        }
        next();
    };
};
//# sourceMappingURL=auth.middleware.js.map