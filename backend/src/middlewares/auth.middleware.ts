import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, verifyRefreshToken } from '../utils/jwt.utils.js';
import { findUserByEmail, findUserById } from '../repositories/user.repositry.js';
import { UserInterface } from '../models/user.model.js';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: UserInterface;
    }
  }
}


// Verify access token middleware
export const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const accessToken = req.cookies.accessToken;
    
    if (!accessToken) {
      res.status(401).json({ message: "Access token not found" });
      return 
    }

    const decoded = verifyAccessToken(accessToken);
    const user = await findUserById(decoded.userId);
    
    if (!user) {
      res.status(401).json({ message: "User not found" });
      return 
    }

    req.user = user;
    next();
  } catch (error) {
   res.status(401).json({ message: "Invalid or expired token" });
   return 
  }
};



// Verify refresh token
export const verifyRefreshTokenMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    
    if (!refreshToken) {
      res.status(401).json({ message: "Refresh token not found" });
      return 
    }

    const decoded = verifyRefreshToken(refreshToken);
    const user = await findUserById(decoded.userId);
    
    if (!user || user.refreshToken !== refreshToken) {
      res.status(401).json({ message: "Invalid refresh token" });
      return 
    }

    req.user = user;
    next();
  } catch (error) {
   res.status(401).json({ message: "Invalid or expired refresh token" });
   return 
  }
};

// Check if user is blocked
export const checkBlockedStatus = async (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.isBlocked) {
    res.status(403).json({ message: "Your account has been blocked" });
    return 
  }
  next();
};

// Role-based authorization middleware
export const authorize = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ message: "Authentication required" });
      return 
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ message: "Access forbidden" });
      return 
    }

    next();
  };
};