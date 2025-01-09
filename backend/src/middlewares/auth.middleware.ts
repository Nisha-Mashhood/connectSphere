import { Request, Response, NextFunction } from 'express';
import { verifyRefreshToken } from '../utils/jwt.utils.js'; 
import { findUserById } from '../repositories/user.repositry.js'; 

export const verifyTokenAndBlockStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get the refresh token from the Authorization header 
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
      res.status(401).json({ message: 'No token provided' });
      return 
    }

    // Verify the refresh token
    const decoded = verifyRefreshToken(token);
    
    // Fetch user by ID from the decoded token
    const user = await findUserById(decoded.userId);
    
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return 
    }
    
    // Check if the user is blocked
    if (user.isBlocked) {
      res.status(403).json({ message: 'Your account has been blocked' });
      return 
    }
    
    // Attach user data to the request object 
    req.user = user;
    
    // Proceed to the next
    next();
  } catch (error:any) {
    res.status(401).json({ message: 'Invalid or expired token', error: error.message });
    return 
  }
};
