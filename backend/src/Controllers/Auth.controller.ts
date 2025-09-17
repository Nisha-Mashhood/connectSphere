import { BaseController } from '../Core/Controller/BaseController';
import { inject } from 'inversify';
import { Request, Response, NextFunction } from 'express';
import type { Express } from "express";
import { AuthService as JWTService } from  '../Utils/Utils/Auth.utils/JWT';
import logger from '../Core/Utils/Logger';
import { ForgotPasswordRequestBody, 
  LoginRequestBody, 
  LogoutRequestBody, 
  OAuthRequestBody, 
  RefreshTokenRequestBody, 
  ResetPasswordRequestBody, 
  SignupRequestBody, 
  UpdateProfileRequestBody, 
  VerifyOTPRequestBody, 
  VerifyPasskeyRequestBody, 
  UpdatePasswordRequestBody, 
  UserQuery
} from '../Utils/Types/Auth.types';
import { IAuthController } from '../Interfaces/Controller/IAuthController';
import { HttpError } from '../Core/Utils/ErrorHandler';
import { StatusCodes } from '../Enums/StatusCode.constants';
import { IAuthService } from '../Interfaces/Services/IUserService';


export class AuthController extends BaseController implements IAuthController{
  private _authService: IAuthService;
  private jwtService: JWTService;

  constructor(@inject('IAuthService') authService : IAuthService) {
    super();
    this._authService = authService;
    this.jwtService = new JWTService();
  }

  // Handle user signup
   signup = async(req: Request<{}, {}, SignupRequestBody>, res: Response, next: NextFunction) =>{
    try {
      const { name, email, password } = req.body;
      logger.debug(`Signup attempt for email: ${email}`);
      if (!name || !email || !password) {
       throw new HttpError('Name, email, and password are required', StatusCodes.BAD_REQUEST);
      }
      const user = await this._authService.signup({ name, email, password });
      this.sendCreated(res, { userId: user.id }, 'User registered successfully');
      logger.info(`User registered: ${user.name} (${email})`);
    } catch (error) {
      logger.error(`Error in signup for email ${req.body.email || 'unknown'}: ${error}`);
      next(error);
    }
  }

  // Handle user login
   login = async(req: Request<{}, {}, LoginRequestBody>, res: Response, next: NextFunction) =>{
    try {
      const { email, password } = req.body;
      logger.debug(`Login attempt for email: ${email}`);
      if (!email || !password) {
       throw new HttpError('Email and password are required', StatusCodes.BAD_REQUEST);
      }
      const { user, accessToken, refreshToken, needsReviewPrompt } = await this._authService.login(email, password);
      // logger.info(`User details : ${user}`)
      this.jwtService.setTokensInCookies(res, accessToken, refreshToken);
      this.sendSuccess(res, { user, needsReviewPrompt }, 'Login successful');
      logger.info(`User logged in: ${user.userId} (${email})`);
    } catch (error) {
      logger.error(`Error in login for email ${req.body.email || 'unknown'}: ${error}`);
      next(error);
    }
  }

  // Handle Google signup
   googleSignup = async(req: Request<{}, {}, OAuthRequestBody>, res: Response, next: NextFunction) =>{
    try {
      const { code } = req.body;
      logger.debug(`Google signup attempt with code: ${code}`);
      if (!code) {
       throw new HttpError('Authorization code is required', StatusCodes.BAD_REQUEST);
      }
      const user = await this._authService.googleSignup(code);
      this.sendCreated(res, { userId: user.id }, 'User signed up successfully');
      logger.info(`Google signup completed for user: ${user.userId} (${user.email})`);
    } catch (error) {
      logger.error(`Error in Google signup: ${error}`);
      next(error);
    }
  }

  // Handle Google login
   googleLogin= async(req: Request<{}, {}, OAuthRequestBody>, res: Response, next: NextFunction) =>{
    try {
      const { code } = req.body;
      logger.debug(`Google login attempt with code: ${code}`);
      if (!code) {
       throw new HttpError('Authorization code is required', StatusCodes.BAD_REQUEST);
      }
      const { user, accessToken, refreshToken, needsReviewPrompt } = await this._authService.googleLogin(code);
      this.jwtService.setTokensInCookies(res, accessToken, refreshToken);
      this.sendSuccess(res, { user, accessToken, refreshToken, needsReviewPrompt }, 'Google login successful');
      logger.info(`Google login completed for user: ${user.userId} (${user.email})`);
    } catch (error) {
      logger.error(`Error in Google login: ${error}`);
      next(error);
    }
  }

  // Handle GitHub signup
   githubSignup = async(req: Request<{}, {}, OAuthRequestBody>, res: Response, next: NextFunction)=>{
    try {
      const { code } = req.body;
      logger.debug(`GitHub signup attempt with code: ${code}`);
      if (!code) {
       throw new HttpError('Authorization code is required', StatusCodes.BAD_REQUEST, );
      }
      const user = await this._authService.githubSignup(code);
      this.sendCreated(res, { userId: user.id }, 'User signed up successfully');
      logger.info(`GitHub signup completed for user: ${user.userId} (${user.email})`);
    } catch (error) {
      logger.error(`Error in GitHub signup: ${error}`);
      next(error);
    }
  }

  // Handle GitHub login
   githubLogin=async(req: Request<{}, {}, OAuthRequestBody>, res: Response, next: NextFunction)=>{
    try {
      const { code } = req.body;
      logger.debug(`GitHub login attempt with code: ${code}`);
      if (!code) {
       throw new HttpError('Authorization code is required', StatusCodes.BAD_REQUEST);
      }
      const { user, accessToken, refreshToken, needsReviewPrompt } = await this._authService.githubLogin(code);
      this.jwtService.setTokensInCookies(res, accessToken, refreshToken);
      this.sendSuccess(res, { user, accessToken, refreshToken, needsReviewPrompt }, 'GitHub login successful');
      logger.info(`GitHub login completed for user: ${user.userId} (${user.email})`);
    } catch (error) {
      logger.error(`Error in GitHub login: ${error}`);
      next(error);
    }
  }

  // Handle refresh token
   refreshToken=async(req: Request<{}, {}, RefreshTokenRequestBody>, res: Response, next: NextFunction)=>{
    try {
      const { refreshToken } = req.body;
      logger.debug(`Refresh token attempt`);
      if (!refreshToken) {
       throw new HttpError('Refresh token is required', StatusCodes.BAD_REQUEST);
      }
      const { newAccessToken } = await this._authService.refreshToken(refreshToken);
      res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", 
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, 
    });
      this.sendSuccess(res, { newAccessToken }, 'Access token refreshed');
      logger.info(`Access token refreshed`);
    } catch (error) {
      logger.error(`Error in refresh token: ${error}`);
      next(error);
    }
  }

  // Check profile completion
   checkProfile=async(req: Request<{ id: string }>, res: Response, next: NextFunction)=>{
    try {
      const userId = req.params.id;
      logger.debug(`Checking profile completion for userId: ${userId}`);
      if (!userId) {
       throw new HttpError('User ID is required', StatusCodes.BAD_REQUEST);
      }
      const isComplete = await this._authService.checkProfileCompletion(userId);
      this.sendSuccess(res, { isProfileComplete: isComplete }, 'Profile completion checked');
      logger.info(`Profile completion checked for userId: ${userId}: ${isComplete}`);
    } catch (error) {
      logger.error(`Error checking profile for userId ${req.params.id || 'unknown'}: ${error}`);
      next(error);
    }
  }

  // Get profile details
   getProfileDetails=async(req: Request<{ id: string }>, res: Response, next: NextFunction) =>{
    try {
      const userId = req.params.id;
      logger.debug(`Fetching profile details for userId: ${userId}`);
      if (!userId) {
       throw new HttpError('User ID is required', StatusCodes.BAD_REQUEST);
      }
      const userDetails = await this._authService.profileDetails(userId);
       if (!userDetails) {
        this.sendSuccess(res, { userDetails: null }, 'No user found');
        logger.info(`No user found for ID: ${userId}`);
        return;
      }
      this.sendSuccess(res, { userDetails }, 'Profile details accessed successfully');
      logger.info(`Profile details fetched for userId: ${userId}`);
    } catch (error) {
      logger.error(`Error fetching profile details for userId ${req.params.id || 'unknown'}: ${error}`);
      next(error);
    }
  }

  // Update user profile
   updateUserDetails=async(req: Request<{ id: string }, {}, UpdateProfileRequestBody>, res: Response, next: NextFunction) =>{
    try {
      const userId = req.params.id;
      logger.debug(`Updating profile for userId: ${userId}`);
      if (!userId) {
       throw new HttpError('User ID is required', StatusCodes.BAD_REQUEST);
      }
      const data: UpdateProfileRequestBody = req.body;
      const profilePicFile = (req.files as { [fieldname: string]: Express.Multer.File[] })?.['profilePic']?.[0];
      const coverPicFile = (req.files as { [fieldname: string]: Express.Multer.File[] })?.['coverPic']?.[0];
      if (profilePicFile) data.profilePicFile = profilePicFile;
      if (coverPicFile) data.coverPicFile = coverPicFile;
      const updatedUser = await this._authService.updateUserProfile(userId, data);
      this.sendSuccess(res, { user: updatedUser }, 'Profile updated successfully');
      logger.info(`Profile updated for userId: ${userId}`);
    } catch (error) {
      logger.error(`Error updating profile for userId ${req.params.id || 'unknown'}: ${error}`);
      next(error);
    }
  }

  // Update user password
  updatePassword = async (req: Request<{ id: string }, {}, UpdatePasswordRequestBody>, res: Response, next: NextFunction) => {
    try {
      const userId = req.params.id;
      logger.debug(`Updating password for userId: ${userId}`);
      if (!userId) {
       throw new HttpError("User ID is required", StatusCodes.BAD_REQUEST);
      }
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
       throw new HttpError("Current and new passwords are required", StatusCodes.BAD_REQUEST);
      }
      const updatedUser = await this._authService.updatePassword(userId, currentPassword, newPassword);
      this.sendSuccess(res, { user: updatedUser }, "Password updated successfully");
      logger.info(`Password updated for userId: ${userId}`);
    } catch (error) {
      logger.error(`Error updating password for userId ${req.params.id || "unknown"}: ${error}`);
      next(error);
    }
  };

  // Handle logout
   logout = async(req: Request<{}, {}, LogoutRequestBody>, res: Response, next: NextFunction) =>{
    try {
      const { email } = req.body;
      logger.debug(`Logout attempt for email: ${email}`);
      if (!email) {
       throw new HttpError('Email is required', StatusCodes.BAD_REQUEST);
      }
      await this._authService.logout(email);
      this.jwtService.clearCookies(res);
      this.sendSuccess(res, {}, 'Logged out successfully');
      logger.info(`User logged out: ${email}`);
    } catch (error) {
      logger.error(`Error in logout for email ${req.body.email || 'unknown'}: ${error}`);
      next(error);
    }
  }

  // Handle forgot password (change during deployement)
   handleForgotPassword=async(req: Request<{}, {}, ForgotPasswordRequestBody>, res: Response, next: NextFunction) =>{
    try {
      const { email } = req.body;
      logger.debug(`Forgot password request for email: ${email}`);
      if (!email) {
       throw new HttpError('Email is required', StatusCodes.BAD_REQUEST);
      }
      const otp = await this._authService.forgotPassword(email);
      this.sendSuccess(res, { otp }, 'OTP sent to email');
      logger.info(`OTP sent to email: ${email}`);
    } catch (error) {
      logger.error(`Error in forgot password for email ${req.body.email || 'unknown'}: ${error}`);
      next(error);
    }
  }

  // Handle verify OTP
   handleVerifyOTP=async(req: Request<{}, {}, VerifyOTPRequestBody>, res: Response, next: NextFunction) =>{
    try {
      const { email, otp } = req.body;
      logger.debug(`Verify OTP attempt for email: ${email}`);
      if (!email || !otp) {
       throw new HttpError('Email and OTP are required', StatusCodes.BAD_REQUEST);
      }
      const token = await this._authService.verifyOTP(email, otp);
      this.sendSuccess(res, { token }, 'OTP verified');
      logger.info(`OTP verified for email: ${email}`);
    } catch (error) {
      logger.error(`Error verifying OTP for email ${req.body.email || 'unknown'}: ${error}`);
      next(error);
    }
  }

  // Handle reset password
   handleResetPassword=async(req: Request<{}, {}, ResetPasswordRequestBody>, res: Response, next: NextFunction) =>{
    try {
      const { email, newPassword } = req.body;
      logger.debug(`Reset password attempt for email: ${email}`);
      if (!email || !newPassword) {
       throw new HttpError('Email and new password are required', StatusCodes.BAD_REQUEST);
      }
      await this._authService.resetPassword(email, newPassword);
      this.sendSuccess(res, {}, 'Password reset successfully');
      logger.info(`Password reset for email: ${email}`);
    } catch (error) {
      logger.error(`Error resetting password for email ${req.body.email || 'unknown'}: ${error}`);
      next(error);
    }
  }

  // Verify admin passkey
   verifyPasskey=async(req: Request<{}, {}, VerifyPasskeyRequestBody>, res: Response, next: NextFunction) =>{
    try {
      const { passkey } = req.body;
      logger.debug(`Verify admin passkey attempt`);
      if (!passkey) {
       throw new HttpError('Passkey is required', StatusCodes.BAD_REQUEST);
      }
      const isValid = await this._authService.verifyAdminPasskey(passkey);
      this.sendSuccess(res, { valid: isValid }, 'Passkey verification completed');
      logger.info(`Admin passkey verification: ${isValid}`);
    } catch (error) {
      logger.error(`Error verifying admin passkey: ${error}`);
      next(error);
    }
  }

  //get all User Details
   getAllUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { search, page, limit, excludeId } = req.query;
      const query: UserQuery = {};

      if (search) query.search = search as string;
      if (page) query.page = parseInt(page as string, 10);
      if (limit) query.limit = parseInt(limit as string, 10);
      if(excludeId) query.excludeId = excludeId as string

      logger.debug(`Fetching users with query: ${JSON.stringify(query)}`);
      const result = await this._authService.getAllUsers(query);

      const data = {
      users: result.users,
      total: result.total,
      page: query.page || 1,
      limit: query.limit || 10,
    };

      // If no users found, return 200 with empty array and message
      if (result.users.length === 0) {
      this.sendSuccess(res, { users: [], total: 0, page: query.page || 1, limit: query.limit || 10 }, 'No users found');
    } else if (!search && !page && !limit) {
      this.sendSuccess(res, { users: result.users }, 'All users fetched successfully');
    } else {
      this.sendSuccess(res, data, 'Users fetched successfully');
    }
    logger.info('Users fetched successfully');

    } catch (error: any) {
      logger.error(`Error in getAllUsers: ${error.message}`);
      next(error)
    }
  }

  fetchAllUsers = async(_req: Request, res: Response, next: NextFunction): Promise<void> =>{
    try {
      const users = await this._authService.fetchAllUsers();
      if (users.length === 0) {
      this.sendSuccess(res, { users: [] }, 'No users found');
    } else {
      this.sendSuccess(res, { users }, 'Users fetched successfully');
    }

    logger.info('Fetched all users');
    } catch (error) {
      logger.info(error);
      next(error)
    }
  }

  //get user Deatils by Id
   getUserById=async(req: Request<{ id: string }>, res: Response, next: NextFunction)=>{
    try {
      const { id } = req.params;
      logger.debug(`Fetching user by ID: ${id}`);
      if (!id) {
       throw new HttpError('User ID is required', StatusCodes.BAD_REQUEST);
      }
      const user = await this._authService.profileDetails(id);
      if (!user) {
        this.sendSuccess(res, { user: null }, 'No user found');
        logger.info(`No user found for ID: ${id}`);
        return;
      }
      this.sendSuccess(res, { user }, 'User retrieved successfully');
      logger.info(`Fetched user: ${id}`);
    } catch (error) {
      logger.error(`Error fetching user ${req.params.id || 'unknown'}: ${error}`);
      next(error);
    }
  }

  //Block teh given User
   blockUser=async(req: Request<{ id: string }>, res: Response, next: NextFunction) =>{
    try {
      const { id } = req.params;
      logger.debug(`Blocking user: ${id}`);
      if (!id) {
       throw new HttpError('User ID is required', StatusCodes.BAD_REQUEST);
      }
      await this._authService.blockUser(id);
      this.sendSuccess(res, {}, 'User blocked successfully');
      logger.info(`Blocked user: ${id}`);
    } catch (error) {
      logger.error(`Error blocking user ${req.params.id || 'unknown'}: ${error}`);
      next(error);
    }
  }

  //Unblock the given user
   unblockUser=async(req: Request<{ id: string }>, res: Response, next: NextFunction) =>{
    try {
      const { id } = req.params;
      logger.debug(`Unblocking user: ${id}`);
      if (!id) {
       throw new HttpError('User ID is required', StatusCodes.BAD_REQUEST);
      }
      await this._authService.unblockUser(id);
      this.sendSuccess(res, {}, 'User unblocked successfully');
      logger.info(`Unblocked user: ${id}`);
    } catch (error) {
      logger.error(`Error unblocking user ${req.params.id || 'unknown'}: ${error}`);
      next(error);
    }
  }

  //Change the user role
   changeRole=async(req: Request<{ id: string }, {}, { role: string }>, res: Response, next: NextFunction) =>{
    try {
      const { id } = req.params;
      const { role } = req.body;
      logger.debug(`Changing role for user: ${id} to ${role}`);
      if (!id || !role) {
       throw new HttpError('User ID and role are required', StatusCodes.BAD_REQUEST);
      }
      const updatedUser = await this._authService.changeRole(id, role);
      this.sendSuccess(res, { user: updatedUser }, 'User role updated successfully');
      logger.info(`Updated role for user: ${id} to ${role}`);
    } catch (error) {
      logger.error(`Error changing role for user ${req.params.id || 'unknown'}: ${error}`);
      next(error);
    }
  }

  getAllUsersAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { search, page, limit } = req.query;
    const query: UserQuery = {};

    if (search) query.search = search as string;
    if (page) query.page = parseInt(page as string, 10);
    if (limit) query.limit = parseInt(limit as string, 10);

    logger.debug(`Fetching users for admin with query: ${JSON.stringify(query)}`);
    const result = await this._authService.getAllUsersAdmin(query);

    const data = {
      users: result.users,
      total: result.total,
      page: query.page || 1,
      limit: query.limit || 10,
    };

    if (result.users.length === 0) {
      this.sendSuccess(res, { users: [], total: 0, page: query.page || 1, limit: query.limit || 10 }, 'No users found');
    } else {
      this.sendSuccess(res, data, 'Users fetched successfully for admin');
    }
    logger.info('Users fetched successfully for admin');
  } catch (error: any) {
    logger.error(`Error in getAllUsersAdmin: ${error.message}`);
    next(error);
  }
}
}