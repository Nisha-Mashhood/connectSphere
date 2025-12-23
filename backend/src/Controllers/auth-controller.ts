import { BaseController } from '../core/controller/base-controller';
import { inject, injectable } from 'inversify';
import { Request, Response, NextFunction } from 'express';
import type { Express } from "express";
import logger from '../core/utils/logger';
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
} from '../Utils/types/auth-types';
import { IAuthController } from '../Interfaces/Controller/i-auth-controller';
import { HttpError } from '../core/utils/error-handler';
import { StatusCodes } from '../enums/status-code-enums';
import { IAuthService } from '../Interfaces/Services/i-user-service';
import { IJWTService } from '../Interfaces/Services/i-jwt-service';
import { AUTH_MESSAGES } from '../constants/messages';
import { ERROR_MESSAGES } from '../constants/error-messages';

@injectable()
export class AuthController extends BaseController implements IAuthController{
  private _authService: IAuthService;
  private _jwtService: IJWTService;

  constructor(
    @inject('IUserService') authService : IAuthService,
    @inject('IJWTService') jwtService : IJWTService
  ) {
    super();
    this._authService = authService;
    this._jwtService = jwtService;
  }

  // Handle user signup
  signup = async (req: Request<{}, {}, SignupRequestBody>, res: Response, next: NextFunction) => {
    try {
      const { name, email, password } = req.body;
      logger.debug(`Signup attempt for email: ${email}`);
      if (!name || !email || !password) {
        throw new HttpError(ERROR_MESSAGES.REQUIRED_NAME_EMAIL_PASSWORD, StatusCodes.BAD_REQUEST);
      }
      const {user, otpId} = await this._authService.signup({ name, email, password });
      this.sendCreated(res, { email: user.email, otpId }, AUTH_MESSAGES.SIGNUP_SUCCESS);
      logger.info(`User registered: ${user.name} (${email})`);
    } catch (error) {
      logger.error(`Error in signup for email ${req.body.email || "unknown"}: ${error}`);
      next(error);
    }
  };

  // Handle user login
  login = async (req: Request<{}, {}, LoginRequestBody>, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;
      logger.debug(`Login attempt for email: ${email}`);
      if (!email || !password) {
        throw new HttpError(ERROR_MESSAGES.REQUIRED_EMAIL_PASSWORD, StatusCodes.BAD_REQUEST);
      }
      const { user, otpId } = await this._authService.login(email, password);
      // this._jwtService.setTokensInCookies(res, accessToken, refreshToken);
      this.sendSuccess(res, { user, otpId }, AUTH_MESSAGES.LOGIN_SUCCESS);
      logger.info(`User logged in otp send for: ${user.userId} (${email})`);
    } catch (error) {
      logger.error(`Error in login for email ${req.body.email || "unknown"}: ${error}`);
      next(error);
    }
  };

  // Handle Google signup
  googleSignup = async (req: Request<{}, {}, OAuthRequestBody>, res: Response, next: NextFunction) => {
    try {
      const { code } = req.body;
      logger.debug(`Google signup attempt with code: ${code}`);
      if (!code) {
        throw new HttpError(ERROR_MESSAGES.REQUIRED_AUTH_CODE, StatusCodes.BAD_REQUEST);
      }
      const {user, otpId} = await this._authService.googleSignup(code);
      this.sendCreated(res, { email: user.email, otpId }, AUTH_MESSAGES.GOOGLE_SIGNUP_SUCCESS);
      logger.info(`Google signup completed for user: ${user.userId} (${user.email})`);
    } catch (error) {
      logger.error(`Error in Google signup: ${error}`);
      next(error);
    }
  };

  // Handle Google login
  googleLogin = async (req: Request<{}, {}, OAuthRequestBody>, res: Response, next: NextFunction) => {
    try {
      const { code } = req.body;
      logger.debug(`Google login attempt with code: ${code}`);
      if (!code) {
        throw new HttpError(ERROR_MESSAGES.REQUIRED_AUTH_CODE, StatusCodes.BAD_REQUEST);
      }
      const { user, otpId } = await this._authService.googleLogin(code);
      this.sendSuccess(res, { user, otpId }, AUTH_MESSAGES.GOOGLE_LOGIN_SUCCESS);
      logger.info(`Google login completed for user: ${user.userId} (${user.email})`);
    } catch (error) {
      logger.error(`Error in Google login: ${error}`);
      next(error);
    }
  };

  // Handle GitHub signup
  githubSignup = async (req: Request<{}, {}, OAuthRequestBody>, res: Response, next: NextFunction) => {
    try {
      const { code } = req.body;
      logger.debug(`GitHub signup attempt with code: ${code}`);
      if (!code) {
        throw new HttpError(ERROR_MESSAGES.REQUIRED_AUTH_CODE, StatusCodes.BAD_REQUEST);
      }
      const{ user, otpId } = await this._authService.githubSignup(code);
      this.sendCreated(res, { email: user.email, otpId }, AUTH_MESSAGES.GITHUB_SIGNUP_SUCCESS);
      logger.info(`GitHub signup completed for user: ${user.userId} (${user.email})`);
    } catch (error) {
      logger.error(`Error in GitHub signup: ${error}`);
      next(error);
    }
  };

  // Handle GitHub login
  githubLogin = async (req: Request<{}, {}, OAuthRequestBody>, res: Response, next: NextFunction) => {
    try {
      const { code } = req.body;
      logger.debug(`GitHub login attempt with code: ${code}`);
      if (!code) {
        throw new HttpError(ERROR_MESSAGES.REQUIRED_AUTH_CODE, StatusCodes.BAD_REQUEST);
      }
      const { user, otpId } = await this._authService.githubLogin(code);
      this.sendSuccess(res, { user, otpId }, AUTH_MESSAGES.GITHUB_LOGIN_SUCCESS);
      logger.info(`GitHub login completed for user: ${user.userId} (${user.email})`);
    } catch (error) {
      logger.error(`Error in GitHub login: ${error}`);
      next(error);
    }
  };

  // Handle refresh token
  refreshToken = async (req: Request<{}, {}, RefreshTokenRequestBody>, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.body;
      logger.debug(`Refresh token attempt`);
      if (!refreshToken) {
        throw new HttpError(ERROR_MESSAGES.REQUIRED_REFRESH_TOKEN, StatusCodes.BAD_REQUEST);
      }
      const { newAccessToken } = await this._authService.refreshToken(refreshToken);
      res.cookie("accessToken", newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 15 * 60 * 1000,
      });
      this.sendSuccess(res, { newAccessToken }, AUTH_MESSAGES.REFRESH_SUCCESS);
      logger.info(`Access token refreshed`);
    } catch (error) {
      logger.error(`Error in refresh token: ${error}`);
      next(error);
    }
  };

  // Check profile completion
  checkProfile = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    try {
      const userId = req.params.id;
      logger.debug(`Checking profile completion for userId: ${userId}`);
      if (!userId) {
        throw new HttpError(ERROR_MESSAGES.REQUIRED_USER_ID, StatusCodes.BAD_REQUEST);
      }
      const isComplete = await this._authService.checkProfileCompletion(userId);
      this.sendSuccess(res, { isProfileComplete: isComplete }, AUTH_MESSAGES.PROFILE_CHECKED);
      logger.info(`Profile completion checked for userId: ${userId}: ${isComplete}`);
    } catch (error) {
      logger.error(`Error checking profile for userId ${req.params.id || "unknown"}: ${error}`);
      next(error);
    }
  };

  // Get profile details
  getProfileDetails = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    try {
      const userId = req.params.id;
      logger.debug(`Fetching profile details for userId: ${userId}`);
      if (!userId) {
        throw new HttpError(ERROR_MESSAGES.REQUIRED_USER_ID, StatusCodes.BAD_REQUEST);
      }
      const userDetails = await this._authService.profileDetails(userId);
      if (!userDetails) {
        this.sendSuccess(res, { userDetails: null }, AUTH_MESSAGES.NO_USER_FOUND);
        logger.info(`No user found for ID: ${userId}`);
        return;
      }
      this.sendSuccess(res, { userDetails }, AUTH_MESSAGES.PROFILE_FETCHED);
      logger.info(`Profile details fetched for userId: ${userId}`);
    } catch (error) {
      logger.error(`Error fetching profile details for userId ${req.params.id || "unknown"}: ${error}`);
      next(error);
    }
  };

  // Update user profile
  updateUserDetails = async (
    req: Request<{ id: string }, {}, UpdateProfileRequestBody>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = req.params.id;
      logger.debug(`Updating profile for userId: ${userId}`);
      if (!userId) {
        throw new HttpError(ERROR_MESSAGES.REQUIRED_USER_ID, StatusCodes.BAD_REQUEST);
      }
      const data: UpdateProfileRequestBody = req.body;
      const profilePicFile = (req.files as { [fieldname: string]: Express.Multer.File[] })?.["profilePic"]?.[0];
      const coverPicFile = (req.files as { [fieldname: string]: Express.Multer.File[] })?.["coverPic"]?.[0];
      if (profilePicFile) data.profilePicFile = profilePicFile;
      if (coverPicFile) data.coverPicFile = coverPicFile;
      const updatedUser = await this._authService.updateUserProfile(userId, data);
      this.sendSuccess(res, { user: updatedUser }, AUTH_MESSAGES.PROFILE_UPDATED);
      logger.info(`Profile updated for userId: ${userId}`);
    } catch (error) {
      logger.error(`Error updating profile for userId ${req.params.id || "unknown"}: ${error}`);
      next(error);
    }
  };

  // Update user password
  updatePassword = async (
    req: Request<{ id: string }, {}, UpdatePasswordRequestBody>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = req.params.id;
      logger.debug(`Updating password for userId: ${userId}`);
      if (!userId) {
        throw new HttpError(ERROR_MESSAGES.REQUIRED_USER_ID, StatusCodes.BAD_REQUEST);
      }
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        throw new HttpError(ERROR_MESSAGES.REQUIRED_CURRENT_NEW_PASSWORD, StatusCodes.BAD_REQUEST);
      }
      const updatedUser = await this._authService.updatePassword(userId, currentPassword, newPassword);
      this.sendSuccess(res, { user: updatedUser }, AUTH_MESSAGES.PASSWORD_UPDATED);
      logger.info(`Password updated for userId: ${userId}`);
    } catch (error) {
      logger.error(`Error updating password for userId ${req.params.id || "unknown"}: ${error}`);
      next(error);
    }
  };

  // Handle logout
  logout = async (req: Request<{}, {}, LogoutRequestBody>, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body;
      logger.debug(`Logout attempt for email: ${email}`);
      if (!email) {
        throw new HttpError(ERROR_MESSAGES.REQUIRED_EMAIL, StatusCodes.BAD_REQUEST);
      }
      await this._authService.logout(email);
      this._jwtService.clearCookies(res);
      this.sendSuccess(res, {}, AUTH_MESSAGES.LOGOUT_SUCCESS);
      logger.info(`User logged out: ${email}`);
    } catch (error) {
      logger.error(`Error in logout for email ${req.body.email || "unknown"}: ${error}`);
      next(error);
    }
  };

  // Handle forgot password
  handleForgotPassword = async (req: Request<{}, {}, ForgotPasswordRequestBody>, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body;
      logger.debug(`Forgot password request for email: ${email}`);
      if (!email) {
        throw new HttpError(ERROR_MESSAGES.REQUIRED_EMAIL, StatusCodes.BAD_REQUEST);
      }
      const otpId = await this._authService.forgotPassword(email);
      this.sendSuccess(res, { otpId }, AUTH_MESSAGES.OTP_SENT);
      logger.info(`OTP sent to email: ${email}`);
    } catch (error) {
      logger.error(`Error in forgot password for email ${req.body.email || "unknown"}: ${error}`);
      next(error);
    }
  };

  // Handle verify OTP
  handleVerifyOTP = async (req: Request<{}, {}, VerifyOTPRequestBody>, res: Response, next: NextFunction) => {
    try {
      const { purpose, email, otpId, otp } = req.body;
      logger.debug(`Verify OTP attempt for email: ${email}`);
      if (!email || !otp) {
        throw new HttpError(ERROR_MESSAGES.REQUIRED_EMAIL_OTP, StatusCodes.BAD_REQUEST);
      }
      const result = await this._authService.verifyOTP(purpose, email, otpId, otp);
      if (result.purpose === "login") {
        this._jwtService.setTokensInCookies(
          res,
          result.accessToken,
          result.refreshToken
        );
      }

      this.sendSuccess(res, result, AUTH_MESSAGES.OTP_VERIFIED);
      logger.info(`OTP verified for email: ${email}`);
    } catch (error) {
      logger.error(`Error verifying OTP for email ${req.body.email || "unknown"}: ${error}`);
      next(error);
    }
  };

  resendOtp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, purpose } = req.body;
    if (!email || !purpose) {
      throw new HttpError( ERROR_MESSAGES.REQUIRED_EMAIL_AND_PURPOSE, StatusCodes.BAD_REQUEST );
    }
    const { otpId } = await this._authService.resendOtp(email, purpose);
    this.sendSuccess( res, { otpId },  AUTH_MESSAGES.OTP_SENT );
  } catch (error) {
    next(error);
  }
};

  // Handle reset password
  handleResetPassword = async (req: Request<{}, {}, ResetPasswordRequestBody>, res: Response, next: NextFunction) => {
    try {
      const { email, newPassword } = req.body;
      logger.debug(`Reset password attempt for email: ${email}`);
      if (!email || !newPassword) {
        throw new HttpError(ERROR_MESSAGES.REQUIRED_EMAIL_NEW_PASSWORD, StatusCodes.BAD_REQUEST);
      }
      await this._authService.resetPassword(email, newPassword);
      this.sendSuccess(res, {}, AUTH_MESSAGES.PASSWORD_RESET);
      logger.info(`Password reset for email: ${email}`);
    } catch (error) {
      logger.error(`Error resetting password for email ${req.body.email || "unknown"}: ${error}`);
      next(error);
    }
  };

  // Verify admin passkey
  verifyPasskey = async (req: Request<{}, {}, VerifyPasskeyRequestBody>, res: Response, next: NextFunction) => {
    try {
      const { passkey } = req.body;
      logger.debug(`Verify admin passkey attempt`);
      if (!passkey) {
        throw new HttpError(ERROR_MESSAGES.REQUIRED_PASSKEY, StatusCodes.BAD_REQUEST);
      }
      const isValid = await this._authService.verifyAdminPasskey(passkey);
      this.sendSuccess(res, { valid: isValid }, AUTH_MESSAGES.PASSKEY_VERIFIED);
      logger.info(`Admin passkey verification: ${isValid}`);
    } catch (error) {
      logger.error(`Error verifying admin passkey: ${error}`);
      next(error);
    }
  };

  // Get all User Details
  getAllUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { search, page, limit, excludeId } = req.query;
      const query: UserQuery = {};

      if (search) query.search = search as string;
      if (page) query.page = parseInt(page as string, 10);
      if (limit) query.limit = parseInt(limit as string, 10);
      if (excludeId) query.excludeId = excludeId as string;

      logger.debug(`Fetching users with query: ${JSON.stringify(query)}`);
      const result = await this._authService.getAllUsers(query);

      const data = {
        users: result.users,
        total: result.total,
        page: query.page || 1,
        limit: query.limit || 10,
      };

      if (result.users.length === 0) {
        this.sendSuccess(res, { users: [], total: 0, page: query.page || 1, limit: query.limit || 10 }, AUTH_MESSAGES.NO_USERS_FOUND);
      } else if (!search && !page && !limit) {
        this.sendSuccess(res, { users: result.users }, AUTH_MESSAGES.USERS_FETCHED);
      } else {
        this.sendSuccess(res, data, AUTH_MESSAGES.USERS_FETCHED);
      }
      logger.info("Users fetched successfully");
    } catch (error: any) {
      logger.error(`Error in getAllUsers: ${error.message}`);
      next(error);
    }
  };

  fetchAllUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {

      const { search, page, limit, excludeId, status } = req.query;
      const query: UserQuery = {};

      if (search) query.search = search as string;
      if (page) query.page = parseInt(page as string, 10);
      if (limit) query.limit = parseInt(limit as string, 10);
      if (excludeId) query.excludeId = excludeId as string;
      if (status) query.status = status as string;

      logger.debug(`Fetching users with query: ${JSON.stringify(query)}`);
      const result = await this._authService.getAllUsersAdmin(query);

      const data = {
        users: result.users,
        total: result.total,
        page: query.page || 1,
        limit: query.limit || 10,
      };

      if (result.users.length === 0) {
        this.sendSuccess(res, { users: [], total: 0, page: query.page || 1, limit: query.limit || 10 }, AUTH_MESSAGES.NO_USERS_FOUND);
      } else if (!search && !page && !limit) {
        this.sendSuccess(res, { users: result.users }, AUTH_MESSAGES.USERS_FETCHED);
      } else {
        this.sendSuccess(res, data, AUTH_MESSAGES.USERS_FETCHED);
      }
      logger.info("Users fetched successfully");
    } catch (error) {
      logger.info(error);
      next(error);
    }
  };

  // Get user Details by Id
  getUserById = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      logger.debug(`Fetching user by ID: ${id}`);
      if (!id) {
        throw new HttpError(ERROR_MESSAGES.REQUIRED_USER_ID, StatusCodes.BAD_REQUEST);
      }
      const user = await this._authService.profileDetails(id);
      if (!user) {
        this.sendSuccess(res, { user: null }, AUTH_MESSAGES.NO_USER_FOUND);
        logger.info(`No user found for ID: ${id}`);
        return;
      }
      this.sendSuccess(res, { user }, AUTH_MESSAGES.USER_FETCHED);
      logger.info(`Fetched user: ${id}`);
    } catch (error) {
      logger.error(`Error fetching user ${req.params.id || "unknown"}: ${error}`);
      next(error);
    }
  };

  // Block the given User
  blockUser = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      logger.debug(`Blocking user: ${id}`);
      if (!id) {
        throw new HttpError(ERROR_MESSAGES.REQUIRED_USER_ID, StatusCodes.BAD_REQUEST);
      }
      await this._authService.blockUser(id);
      this.sendSuccess(res, {}, AUTH_MESSAGES.USER_BLOCKED);
      logger.info(`Blocked user: ${id}`);
    } catch (error) {
      logger.error(`Error blocking user ${req.params.id || "unknown"}: ${error}`);
      next(error);
    }
  };

  // Unblock the given user
  unblockUser = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      logger.debug(`Unblocking user: ${id}`);
      if (!id) {
        throw new HttpError(ERROR_MESSAGES.REQUIRED_USER_ID, StatusCodes.BAD_REQUEST);
      }
      await this._authService.unblockUser(id);
      this.sendSuccess(res, {}, AUTH_MESSAGES.USER_UNBLOCKED);
      logger.info(`Unblocked user: ${id}`);
    } catch (error) {
      logger.error(`Error unblocking user ${req.params.id || "unknown"}: ${error}`);
      next(error);
    }
  };

  // Change the user role
  changeRole = async (req: Request<{ id: string }, {}, { role: string }>, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { role } = req.body;
      logger.debug(`Changing role for user: ${id} to ${role}`);
      if (!id || !role) {
        throw new HttpError(ERROR_MESSAGES.REQUIRED_USER_ID_ROLE, StatusCodes.BAD_REQUEST);
      }
      const updatedUser = await this._authService.changeRole(id, role);
      this.sendSuccess(res, { user: updatedUser }, AUTH_MESSAGES.ROLE_CHANGED);
      logger.info(`Updated role for user: ${id} to ${role}`);
    } catch (error) {
      logger.error(`Error changing role for user ${req.params.id || "unknown"}: ${error}`);
      next(error);
    }
  };

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
        this.sendSuccess(res, { users: [], total: 0, page: query.page || 1, limit: query.limit || 10 }, AUTH_MESSAGES.NO_USERS_FOUND);
      } else {
        this.sendSuccess(res, data, AUTH_MESSAGES.USERS_ADMIN_FETCHED);
      }
      logger.info("Users fetched successfully for admin");
    } catch (error: any) {
      logger.error(`Error in getAllUsersAdmin: ${error.message}`);
      next(error);
    }
  };
}