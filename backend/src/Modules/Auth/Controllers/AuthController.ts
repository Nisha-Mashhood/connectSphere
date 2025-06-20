import { BaseController } from './../../../core/Controller/BaseController.js';
import { AuthService } from '../Service/AuthService.js';
import { Request, Response } from 'express';
import { AuthService as JWTService } from  '../Utils/JWT.js';
import logger from '../../../core/Utils/Logger.js';
import { UserInterface as IUser } from '../../../Interfaces/models/IUser.js';

// Interface for signup request body
interface SignupRequestBody {
  name: string;
  email: string;
  password: string;
}

// Interface for login request body
interface LoginRequestBody {
  email: string;
  password: string;
}

// Interface for OAuth request body
interface OAuthRequestBody {
  code: string;
}

// Interface for refresh token request body
interface RefreshTokenRequestBody {
  refreshToken: string;
}

// Interface for forgot password request body
interface ForgotPasswordRequestBody {
  email: string;
}

// Interface for verify OTP request body
interface VerifyOTPRequestBody {
  email: string;
  otp: string;
}

// Interface for reset password request body
interface ResetPasswordRequestBody {
  email: string;
  newPassword: string;
}

// Interface for logout request body
interface LogoutRequestBody {
  email: string;
}

// Interface for verify passkey request body
interface VerifyPasskeyRequestBody {
  passkey: string;
}

// Interface for update profile request body
interface UpdateProfileRequestBody extends Partial<IUser> {
  profilePicFile?: Express.Multer.File;
  coverPicFile?: Express.Multer.File;
}

// Controller for authentication and user profile endpoints
export class AuthController extends BaseController {
  private authService: AuthService;
  private jwtService: JWTService;

  constructor() {
    super();
    this.authService = new AuthService();
    this.jwtService = new JWTService();
  }

  // Handle user signup
   signup = async(req: Request<{}, {}, SignupRequestBody>, res: Response) =>{
    try {
      const { name, email, password } = req.body;
      logger.debug(`Signup attempt for email: ${email}`);
      if (!name || !email || !password) {
        this.throwError(400, 'Name, email, and password are required');
      }
      const user = await this.authService.signup({ name, email, password });
      this.sendCreated(res, { userId: user._id }, 'User registered successfully');
      logger.info(`User registered: ${user.userId} (${email})`);
    } catch (error) {
      logger.error(`Error in signup for email ${req.body.email || 'unknown'}: ${error}`);
      this.handleError(error, res);
    }
  }

  // Handle user login
   login = async(req: Request<{}, {}, LoginRequestBody>, res: Response) =>{
    try {
      const { email, password } = req.body;
      logger.debug(`Login attempt for email: ${email}`);
      if (!email || !password) {
        this.throwError(400, 'Email and password are required');
      }
      const { user, accessToken, refreshToken, needsReviewPrompt } = await this.authService.login(email, password);
      // logger.info(`User details : ${user}`)
      this.jwtService.setTokensInCookies(res, accessToken, refreshToken);
      this.sendSuccess(res, { user, needsReviewPrompt }, 'Login successful');
      logger.info(`User logged in: ${user.userId} (${email})`);
    } catch (error) {
      logger.error(`Error in login for email ${req.body.email || 'unknown'}: ${error}`);
      this.handleError(error, res);
    }
  }

  // Handle Google signup
   googleSignup = async(req: Request<{}, {}, OAuthRequestBody>, res: Response) =>{
    try {
      const { code } = req.body;
      logger.debug(`Google signup attempt with code: ${code}`);
      if (!code) {
        this.throwError(400, 'Authorization code is required');
      }
      const user = await this.authService.googleSignup(code);
      this.sendCreated(res, { userId: user._id }, 'User signed up successfully');
      logger.info(`Google signup completed for user: ${user.userId} (${user.email})`);
    } catch (error) {
      logger.error(`Error in Google signup: ${error}`);
      this.handleError(error, res);
    }
  }

  // Handle Google login
   googleLogin= async(req: Request<{}, {}, OAuthRequestBody>, res: Response) =>{
    try {
      const { code } = req.body;
      logger.debug(`Google login attempt with code: ${code}`);
      if (!code) {
        this.throwError(400, 'Authorization code is required');
      }
      const { user, accessToken, refreshToken, needsReviewPrompt } = await this.authService.googleLogin(code);
      this.jwtService.setTokensInCookies(res, accessToken, refreshToken);
      this.sendSuccess(res, { user, accessToken, refreshToken, needsReviewPrompt }, 'Google login successful');
      logger.info(`Google login completed for user: ${user.userId} (${user.email})`);
    } catch (error) {
      logger.error(`Error in Google login: ${error}`);
      this.handleError(error, res);
    }
  }

  // Handle GitHub signup
   githubSignup = async(req: Request<{}, {}, OAuthRequestBody>, res: Response)=>{
    try {
      const { code } = req.body;
      logger.debug(`GitHub signup attempt with code: ${code}`);
      if (!code) {
        this.throwError(400, 'Authorization code is required');
      }
      const user = await this.authService.githubSignup(code);
      this.sendCreated(res, { userId: user._id }, 'User signed up successfully');
      logger.info(`GitHub signup completed for user: ${user.userId} (${user.email})`);
    } catch (error) {
      logger.error(`Error in GitHub signup: ${error}`);
      this.handleError(error, res);
    }
  }

  // Handle GitHub login
   githubLogin=async(req: Request<{}, {}, OAuthRequestBody>, res: Response)=>{
    try {
      const { code } = req.body;
      logger.debug(`GitHub login attempt with code: ${code}`);
      if (!code) {
        this.throwError(400, 'Authorization code is required');
      }
      const { user, accessToken, refreshToken, needsReviewPrompt } = await this.authService.githubLogin(code);
      this.jwtService.setTokensInCookies(res, accessToken, refreshToken);
      this.sendSuccess(res, { user, accessToken, refreshToken, needsReviewPrompt }, 'GitHub login successful');
      logger.info(`GitHub login completed for user: ${user.userId} (${user.email})`);
    } catch (error) {
      logger.error(`Error in GitHub login: ${error}`);
      this.handleError(error, res);
    }
  }

  // Handle refresh token
   refreshToken=async(req: Request<{}, {}, RefreshTokenRequestBody>, res: Response)=>{
    try {
      const { refreshToken } = req.body;
      logger.debug(`Refresh token attempt`);
      if (!refreshToken) {
        this.throwError(400, 'Refresh token is required');
      }
      const { newAccessToken } = await this.authService.refreshToken(refreshToken);
      this.sendSuccess(res, { newAccessToken }, 'Access token refreshed');
      logger.info(`Access token refreshed`);
    } catch (error) {
      logger.error(`Error in refresh token: ${error}`);
      this.handleError(error, res);
    }
  }

  // Check profile completion
   checkProfile=async(req: Request<{ id: string }>, res: Response)=>{
    try {
      const userId = req.params.id;
      logger.debug(`Checking profile completion for userId: ${userId}`);
      if (!userId) {
        this.throwError(400, 'User ID is required');
      }
      const isComplete = await this.authService.checkProfileCompletion(userId);
      this.sendSuccess(res, { isProfileComplete: isComplete }, 'Profile completion checked');
      logger.info(`Profile completion checked for userId: ${userId}: ${isComplete}`);
    } catch (error) {
      logger.error(`Error checking profile for userId ${req.params.id || 'unknown'}: ${error}`);
      this.handleError(error, res);
    }
  }

  // Get profile details
   getProfileDetails=async(req: Request<{ id: string }>, res: Response) =>{
    try {
      const userId = req.params.id;
      logger.debug(`Fetching profile details for userId: ${userId}`);
      if (!userId) {
        this.throwError(400, 'User ID is required');
      }
      const userDetails = await this.authService.profileDetails(userId);
      this.sendSuccess(res, { userDetails }, 'Profile details accessed successfully');
      logger.info(`Profile details fetched for userId: ${userId}`);
    } catch (error) {
      logger.error(`Error fetching profile details for userId ${req.params.id || 'unknown'}: ${error}`);
      this.handleError(error, res);
    }
  }

  // Update user profile
   updateUserDetails=async(req: Request<{ id: string }, {}, UpdateProfileRequestBody>, res: Response) =>{
    try {
      const userId = req.params.id;
      logger.debug(`Updating profile for userId: ${userId}`);
      if (!userId) {
        this.throwError(400, 'User ID is required');
      }
      const data: UpdateProfileRequestBody = req.body;
      const profilePicFile = (req.files as { [fieldname: string]: Express.Multer.File[] })?.['profilePic']?.[0];
      const coverPicFile = (req.files as { [fieldname: string]: Express.Multer.File[] })?.['coverPic']?.[0];
      if (profilePicFile) data.profilePicFile = profilePicFile;
      if (coverPicFile) data.coverPicFile = coverPicFile;
      const updatedUser = await this.authService.updateUserProfile(userId, data);
      this.sendSuccess(res, { user: updatedUser }, 'Profile updated successfully');
      logger.info(`Profile updated for userId: ${userId}`);
    } catch (error) {
      logger.error(`Error updating profile for userId ${req.params.id || 'unknown'}: ${error}`);
      this.handleError(error, res);
    }
  }

  // Handle logout
   logout = async(req: Request<{}, {}, LogoutRequestBody>, res: Response) =>{
    try {
      const { email } = req.body;
      logger.debug(`Logout attempt for email: ${email}`);
      if (!email) {
        this.throwError(400, 'Email is required');
      }
      await this.authService.logout(email);
      this.jwtService.clearCookies(res);
      this.sendSuccess(res, {}, 'Logged out successfully');
      logger.info(`User logged out: ${email}`);
    } catch (error) {
      logger.error(`Error in logout for email ${req.body.email || 'unknown'}: ${error}`);
      this.handleError(error, res);
    }
  }

  // Handle forgot password
   handleForgotPassword=async(req: Request<{}, {}, ForgotPasswordRequestBody>, res: Response) =>{
    try {
      const { email } = req.body;
      logger.debug(`Forgot password request for email: ${email}`);
      if (!email) {
        this.throwError(400, 'Email is required');
      }
      const otp = await this.authService.forgotPassword(email);
      this.sendSuccess(res, { otp }, 'OTP sent to email'); //change during deployement
      logger.info(`OTP sent to email: ${email}`);
    } catch (error) {
      logger.error(`Error in forgot password for email ${req.body.email || 'unknown'}: ${error}`);
      this.handleError(error, res);
    }
  }

  // Handle verify OTP
   handleVerifyOTP=async(req: Request<{}, {}, VerifyOTPRequestBody>, res: Response) =>{
    try {
      const { email, otp } = req.body;
      logger.debug(`Verify OTP attempt for email: ${email}`);
      if (!email || !otp) {
        this.throwError(400, 'Email and OTP are required');
      }
      const token = await this.authService.verifyOTP(email, otp);
      this.sendSuccess(res, { token }, 'OTP verified');
      logger.info(`OTP verified for email: ${email}`);
    } catch (error) {
      logger.error(`Error verifying OTP for email ${req.body.email || 'unknown'}: ${error}`);
      this.handleError(error, res);
    }
  }

  // Handle reset password
   handleResetPassword=async(req: Request<{}, {}, ResetPasswordRequestBody>, res: Response) =>{
    try {
      const { email, newPassword } = req.body;
      logger.debug(`Reset password attempt for email: ${email}`);
      if (!email || !newPassword) {
        this.throwError(400, 'Email and new password are required');
      }
      await this.authService.resetPassword(email, newPassword);
      this.sendSuccess(res, {}, 'Password reset successfully');
      logger.info(`Password reset for email: ${email}`);
    } catch (error) {
      logger.error(`Error resetting password for email ${req.body.email || 'unknown'}: ${error}`);
      this.handleError(error, res);
    }
  }

  // Verify admin passkey
   verifyPasskey=async(req: Request<{}, {}, VerifyPasskeyRequestBody>, res: Response) =>{
    try {
      const { passkey } = req.body;
      logger.debug(`Verify admin passkey attempt`);
      if (!passkey) {
        this.throwError(400, 'Passkey is required');
      }
      const isValid = await this.authService.verifyAdminPasskey(passkey);
      this.sendSuccess(res, { valid: isValid }, 'Passkey verification completed');
      logger.info(`Admin passkey verification: ${isValid}`);
    } catch (error) {
      logger.error(`Error verifying admin passkey: ${error}`);
      this.handleError(error, res);
    }
  }

  //get all User Details
   getAllUsers = async(_req: Request, res: Response) =>{
    try {
      logger.debug(`Fetching all users`);
      const users = await this.authService.getAllUsers();
      this.sendSuccess(res, { users }, 'Users retrieved successfully');
      logger.info(`Fetched all users`);
    } catch (error) {
      logger.error(`Error fetching all users: ${error}`);
      this.handleError(error, res);
    }
  }

  //get user Deatils by Id
   getUserById=async(req: Request<{ id: string }>, res: Response)=>{
    try {
      const { id } = req.params;
      logger.debug(`Fetching user by ID: ${id}`);
      if (!id) {
        this.throwError(400, 'User ID is required');
      }
      const user = await this.authService.profileDetails(id);
      this.sendSuccess(res, { user }, 'User retrieved successfully');
      logger.info(`Fetched user: ${id}`);
    } catch (error) {
      logger.error(`Error fetching user ${req.params.id || 'unknown'}: ${error}`);
      this.handleError(error, res);
    }
  }

  //Block teh given User
   blockUser=async(req: Request<{ id: string }>, res: Response) =>{
    try {
      const { id } = req.params;
      logger.debug(`Blocking user: ${id}`);
      if (!id) {
        this.throwError(400, 'User ID is required');
      }
      await this.authService.blockUser(id);
      this.sendSuccess(res, {}, 'User blocked successfully');
      logger.info(`Blocked user: ${id}`);
    } catch (error) {
      logger.error(`Error blocking user ${req.params.id || 'unknown'}: ${error}`);
      this.handleError(error, res);
    }
  }

  //Unblock the given user
   unblockUser=async(req: Request<{ id: string }>, res: Response) =>{
    try {
      const { id } = req.params;
      logger.debug(`Unblocking user: ${id}`);
      if (!id) {
        this.throwError(400, 'User ID is required');
      }
      await this.authService.unblockUser(id);
      this.sendSuccess(res, {}, 'User unblocked successfully');
      logger.info(`Unblocked user: ${id}`);
    } catch (error) {
      logger.error(`Error unblocking user ${req.params.id || 'unknown'}: ${error}`);
      this.handleError(error, res);
    }
  }

  //Change the user role
   changeRole=async(req: Request<{ id: string }, {}, { role: string }>, res: Response) =>{
    try {
      const { id } = req.params;
      const { role } = req.body;
      logger.debug(`Changing role for user: ${id} to ${role}`);
      if (!id || !role) {
        this.throwError(400, 'User ID and role are required');
      }
      const updatedUser = await this.authService.changeRole(id, role);
      this.sendSuccess(res, { user: updatedUser }, 'User role updated successfully');
      logger.info(`Updated role for user: ${id} to ${role}`);
    } catch (error) {
      logger.error(`Error changing role for user ${req.params.id || 'unknown'}: ${error}`);
      this.handleError(error, res);
    }
  }
}