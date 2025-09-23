import { inject, injectable } from "inversify";
import { ServiceError } from "../Core/Utils/ErrorHandler";
import { IUser } from "../Interfaces/Models/IUser";
import bcrypt from "bcryptjs";
import { generateOTP } from "../Utils/Utils/Auth.utils/OTP";
import { sendEmail } from "../Core/Utils/Email";
import config from "../config/env.config";
import { uploadMedia } from "../Core/Utils/Cloudinary";
import { OAuth2Client } from "../Utils/Utils/Auth.utils/GoogleConfig";
import axios from "axios";
import logger from "../Core/Utils/Logger";
import {
  ProfileUpdateData,
  SignupData,
  UserQuery,
} from "../Utils/Types/Auth.types";
import { IAuthService } from "../Interfaces/Services/IUserService";
import { StatusCodes } from "../Enums/StatusCode.enums";
import { IUserAdminDTO, IUserDTO } from "../Interfaces/DTOs/IUserDTO";
import { toUserAdminDTOs, toUserDTO, toUserDTOs } from "../Utils/Mappers/UserMapper";
import { IUserRepository } from "../Interfaces/Repository/IUserRepository";
import { INotificationService } from "../Interfaces/Services/INotificationService";
import { IJWTService } from "../Interfaces/Services/IJWTService";

// Temporary OTP storage (replace with Redis in production)
const otpStore: Record<string, string> = {};

@injectable()
export class AuthService implements IAuthService {
  private _userRepository: IUserRepository;
  private _notificationService: INotificationService;
  private _jwtService: IJWTService;

  constructor(
    @inject('IUserRepository') userRepository :IUserRepository,
    @inject('INotificationService') notificationservice : INotificationService,
    @inject('IJWTService') jwtService :IJWTService
  ) {
    this._userRepository =  userRepository;
    this._notificationService = notificationservice;
    this._jwtService = jwtService;
  }

  //Notify admin for New User
  private notifyAdminsOfNewUser = async (user: IUser): Promise<void> => {
    try {
      // Find all admin users
      const admins = await this._userRepository.getAllAdmins();
      if (admins.length === 0) {
        logger.info("No admins found to notify for new user registration");
        return;
      }
      logger.info(admins);
      // Create new_user notifications for each admin
      for (const admin of admins) {
        const notification = await this._notificationService.sendNotification(
          admin._id.toString(),
          "new_user",
          user._id.toString(),
          user._id.toString(),
          "profile"
        );
        logger.info(
          `Created new_user notification for admin ${admin._id}: ${notification.id}`
        );
      }
      logger.info(`Created new_user notifications for ${admins.length} admins`);
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(
        `Error notifying admins of new user ${user._id}: ${err.message}`
      );
      throw new ServiceError(
        `Failed to notify admins`,
        StatusCodes.INTERNAL_SERVER_ERROR,
        err
      );
    }
  };

  public signup = async (data: SignupData): Promise<IUserDTO> => {
    try {
      const { name, email, password } = data;
      const userExists = await this._userRepository.findUserByEmail(email);
      if (userExists) {
        throw new ServiceError("User already exists", StatusCodes.BAD_REQUEST);
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await this._userRepository.createUser({
        name,
        email,
        password: hashedPassword,
      });

      logger.info(`User created successfully: ${user._id}`);

      // Notify admins of new user
      await this.notifyAdminsOfNewUser(user);
      return toUserDTO(user)!; //Return value is not null
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error in signup for email ${data.email}: ${err.message}`);
      throw error instanceof ServiceError
        ? error
        : new ServiceError(
            "Failed to signup user",
            StatusCodes.INTERNAL_SERVER_ERROR,
            err
          );
    }
  };

  public login = async (
    email: string,
    password: string
  ): Promise<{
    user: IUserDTO;
    accessToken: string;
    refreshToken: string;
    needsReviewPrompt: boolean;
  }> => {
    try {
      const user = await this._userRepository.findUserByEmail(email);
      if (!user) {
        throw new ServiceError("User not found", StatusCodes.NOT_FOUND);
      }
      if (user.isBlocked) {
        throw new ServiceError("Blocked", StatusCodes.FORBIDDEN);
      }
      if (!user.password) {
        throw new ServiceError(
          "This account is registered using a third-party provider. Please log in with your provider",
          StatusCodes.BAD_REQUEST
        );
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        throw new ServiceError("Invalid credentials", StatusCodes.BAD_REQUEST);
      }
      await this._userRepository.incrementLoginCount(user._id.toString());
      const updatedUser = await this._userRepository.findById(
        user._id.toString()
      );
      if (!updatedUser) {
        throw new ServiceError(
          "User not found after login count update",
          StatusCodes.NOT_FOUND
        );
      }
      const accessToken = this._jwtService.generateAccessToken({
        userId: user._id,
        userRole: user.role,
      });
      const refreshToken = this._jwtService.generateRefreshToken({
        userId: user._id,
        userRole: user.role,
      });
      await this._userRepository.updateRefreshToken(
        user._id.toString(),
        refreshToken
      );
      const needsReviewPrompt =
        updatedUser.loginCount >= 5 && !updatedUser.hasReviewed;
      logger.info(
        `User ${email} logged in. loginCount: ${updatedUser.loginCount}, needsReviewPrompt: ${needsReviewPrompt}`
      );
      return {
        user: toUserDTO(updatedUser)!,
        accessToken,
        refreshToken,
        needsReviewPrompt,
      };
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error in login for email ${email}: ${err.message}`);
      throw error instanceof ServiceError
        ? error
        : new ServiceError(
            "Failed to login user",
            StatusCodes.INTERNAL_SERVER_ERROR,
            err
          );
    }
  };

  public googleSignup = async (code: string): Promise<IUserDTO> => {
    try {
      const { tokens } = await OAuth2Client.getToken(code);
      OAuth2Client.setCredentials(tokens);
      const userRes = await axios.get(
        `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${tokens.access_token}`
      );
      const { email, name, picture } = userRes.data;
      const existingUser = await this._userRepository.findUserByEmail(email);
      if (existingUser) {
        throw new ServiceError(
          "Email already registered",
          StatusCodes.BAD_REQUEST
        );
      }
      const user = await this._userRepository.createUser({
        name,
        email,
        provider: "google",
        providerId: tokens.id_token,
        profilePic: picture,
        password: null,
      });

      logger.info(`User created successfully: ${user._id}`);

      // Notify admins of new user
      await this.notifyAdminsOfNewUser(user);

      return toUserDTO(user)!;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error in Google signup: ${err.message}`);
      throw error instanceof ServiceError
        ? error
        : new ServiceError(
            "Google signup failed",
            StatusCodes.INTERNAL_SERVER_ERROR,
            err
          );
    }
  };

  public googleLogin = async (
    code: string
  ): Promise<{
    user: IUserDTO;
    accessToken: string;
    refreshToken: string;
    needsReviewPrompt: boolean;
  }> => {
    try {
      const { tokens } = await OAuth2Client.getToken(code);
      OAuth2Client.setCredentials(tokens);
      const userRes = await axios.get(
        `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${tokens.access_token}`
      );
      const { email } = userRes.data;
      const existingUser = await this._userRepository.findUserByEmail(email);
      if (!existingUser) {
        throw new ServiceError("Email not registered", StatusCodes.NOT_FOUND);
      }
      await this._userRepository.incrementLoginCount(
        existingUser._id.toString()
      );
      const updatedUser = await this._userRepository.findById(
        existingUser._id.toString()
      );
      if (!updatedUser) {
        throw new ServiceError(
          "User not found after login count update",
          StatusCodes.NOT_FOUND
        );
      }
      const accessToken = this._jwtService.generateAccessToken({
        userId: existingUser._id,
        userRole: existingUser.role,
      });
      const refreshToken = this._jwtService.generateRefreshToken({
        userId: existingUser._id,
        userRole: existingUser.role,
      });
      await this._userRepository.updateRefreshToken(
        existingUser._id.toString(),
        refreshToken
      );
      const needsReviewPrompt =
        updatedUser.loginCount >= 5 && !updatedUser.hasReviewed;
      logger.info(
        `Google login for ${email}. loginCount: ${updatedUser.loginCount}, needsReviewPrompt: ${needsReviewPrompt}`
      );
      return {
        user: toUserDTO(updatedUser)!,
        accessToken,
        refreshToken,
        needsReviewPrompt,
      };
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error in Google login: ${err.message}`);
      throw error instanceof ServiceError
        ? error
        : new ServiceError(
            "Google login failed",
            StatusCodes.INTERNAL_SERVER_ERROR,
            err
          );
    }
  };

  public githubSignup = async (code: string): Promise<IUserDTO> => {
    try {
      const tokenResponse = await axios.post(
        "https://github.com/login/oauth/access_token",
        {
          client_id: config.githubclientid,
          client_secret: config.githubclientsecret,
          code,
        },
        { headers: { Accept: "application/json" } }
      );
      const { access_token } = tokenResponse.data;
      const userResponse = await axios.get("https://api.github.com/user", {
        headers: { Authorization: `Bearer ${access_token}` },
      });
      let email = userResponse.data.email;
      if (!email) {
        const emailsResponse = await axios.get(
          "https://api.github.com/user/emails",
          {
            headers: { Authorization: `Bearer ${access_token}` },
          }
        );
        const primaryEmail = emailsResponse.data.find((e: any) => e.primary);
        if (!primaryEmail) {
          throw new ServiceError(
            "Email not found for GitHub user",
            StatusCodes.BAD_REQUEST
          );
        }
        email = primaryEmail.email;
      }
      const existingUser = await this._userRepository.findUserByEmail(email);
      if (existingUser) {
        throw new ServiceError(
          "Email already registered",
          StatusCodes.BAD_REQUEST
        );
      }
      const user = await this._userRepository.createUser({
        name: userResponse.data.name || userResponse.data.login,
        email,
        provider: "github",
        providerId: userResponse.data.login,
        profilePic: userResponse.data.avatar_url,
        password: null,
      });

      logger.info(`User created successfully: ${user._id}`);

      // Notify admins of new user
      await this.notifyAdminsOfNewUser(user);

      return toUserDTO(user)!;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error in GitHub signup: ${err.message}`);
      throw error instanceof ServiceError
        ? error
        : new ServiceError(
            "GitHub signup failed",
            StatusCodes.INTERNAL_SERVER_ERROR,
            err
          );
    }
  };

  public githubLogin = async (
    code: string
  ): Promise<{
    user: IUserDTO;
    accessToken: string;
    refreshToken: string;
    needsReviewPrompt: boolean;
  }> => {
    try {
      const tokenResponse = await axios.post(
        "https://github.com/login/oauth/access_token",
        {
          client_id: config.githubclientid,
          client_secret: config.githubclientsecret,
          code,
        },
        { headers: { Accept: "application/json" } }
      );
      const { access_token } = tokenResponse.data;
      const userResponse = await axios.get("https://api.github.com/user", {
        headers: { Authorization: `Bearer ${access_token}` },
      });
      let email = userResponse.data.email;
      if (!email) {
        const emailsResponse = await axios.get(
          "https://api.github.com/user/emails",
          {
            headers: { Authorization: `Bearer ${access_token}` },
          }
        );
        const primaryEmail = emailsResponse.data.find((e: any) => e.primary);
        if (!primaryEmail) {
          throw new ServiceError(
            "Email not found for GitHub user",
            StatusCodes.BAD_REQUEST
          );
        }
        email = primaryEmail.email;
      }
      const existingUser = await this._userRepository.findUserByEmail(email);
      if (!existingUser) {
        throw new ServiceError("Email not registered", StatusCodes.NOT_FOUND);
      }
      await this._userRepository.incrementLoginCount(
        existingUser._id.toString()
      );
      const updatedUser = await this._userRepository.findById(
        existingUser._id.toString()
      );
      if (!updatedUser) {
        throw new ServiceError(
          "User not found after login count update",
          StatusCodes.NOT_FOUND
        );
      }
      const accessToken = this._jwtService.generateAccessToken({
        userId: existingUser._id,
        userRole: existingUser.role,
      });
      const refreshToken = this._jwtService.generateRefreshToken({
        userId: existingUser._id,
        userRole: existingUser.role,
      });
      await this._userRepository.updateRefreshToken(
        existingUser._id.toString(),
        refreshToken
      );
      const needsReviewPrompt =
        updatedUser.loginCount >= 5 && !updatedUser.hasReviewed;
      logger.info(
        `GitHub login for ${email}. loginCount: ${updatedUser.loginCount}, needsReviewPrompt: ${needsReviewPrompt}`
      );
      return {
        user: toUserDTO(updatedUser)!,
        accessToken,
        refreshToken,
        needsReviewPrompt,
      };
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error in GitHub login: ${err.message}`);
      throw error instanceof ServiceError
        ? error
        : new ServiceError(
            "GitHub login failed",
            StatusCodes.INTERNAL_SERVER_ERROR,
            err
          );
    }
  };

  public refreshToken = async (
    refreshToken: string
  ): Promise<{ newAccessToken: string }> => {
    try {
      const decoded = this._jwtService.verifyRefreshToken(refreshToken);
      const newAccessToken = this._jwtService.generateAccessToken({
        userId: decoded.userId,
      });
      logger.info(`Refreshed access token for userId: ${decoded.userId}`);
      return { newAccessToken };
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error refreshing token: ${err.message}`);
      throw new ServiceError(
        "Invalid or expired refresh token",
        StatusCodes.BAD_REQUEST,
        err
      );
    }
  };

  public forgotPassword = async (email: string): Promise<string> => {
    try {
      const user = await this._userRepository.findUserByEmail(email);
      if (!user) {
        throw new ServiceError("User not found", StatusCodes.NOT_FOUND);
      }
      const otp = generateOTP();
      otpStore[email] = otp;
      await sendEmail(email, "Password Reset OTP", `Your OTP is ${otp}`);
      logger.info(`Sent OTP to ${email}`);
      return otp; // Remove in production
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error in forgot password for ${email}: ${err.message}`);
      throw error instanceof ServiceError
        ? error
        : new ServiceError(
            "Failed to send OTP",
            StatusCodes.INTERNAL_SERVER_ERROR,
            err
          );
    }
  };

  public verifyOTP = async (email: string, otp: string): Promise<string> => {
    try {
      if (otpStore[email] !== otp) {
        throw new ServiceError(
          "Invalid or expired OTP",
          StatusCodes.BAD_REQUEST
        );
      }
      delete otpStore[email];
      const token = this._jwtService.generateAccessToken({ email }, "10m");
      logger.info(`OTP verified for ${email}`);
      return token;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error verifying OTP for ${email}: ${err.message}`);
      throw error instanceof ServiceError
        ? error
        : new ServiceError(
            "Failed to verify OTP",
            StatusCodes.INTERNAL_SERVER_ERROR,
            err
          );
    }
  };

  public resetPassword = async (
    email: string,
    newPassword: string
  ): Promise<void> => {
    try {
      const user = await this._userRepository.findUserByEmail(email);
      if (!user) {
        throw new ServiceError("User not found", StatusCodes.NOT_FOUND);
      }
      if (user.password && (await bcrypt.compare(newPassword, user.password))) {
        throw new ServiceError(
          "New password cannot be the same as the old password",
          StatusCodes.BAD_REQUEST
        );
      }
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await this._userRepository.updatePassword(
        user._id.toString(),
        hashedPassword
      );
      logger.info(`Password reset for ${email}`);
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error resetting password for ${email}: ${err.message}`);
      throw error instanceof ServiceError
        ? error
        : new ServiceError(
            "Failed to reset password",
            StatusCodes.INTERNAL_SERVER_ERROR,
            err
          );
    }
  };

  public logout = async (email: string): Promise<void> => {
    try {
      await this._userRepository.removeRefreshToken(email);
      logger.info(`User ${email} logged out`);
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error logging out user ${email}: ${err.message}`);
      throw new ServiceError(
        "Failed to logout user",
        StatusCodes.INTERNAL_SERVER_ERROR,
        err
      );
    }
  };

  public verifyAdminPasskey = async (passkey: string): Promise<boolean> => {
    logger.info(
      `AdminPasskey from Server :${config.adminpasscode} and passkey from front end : ${passkey}`
    );
    try {
      if (passkey !== config.adminpasscode) {
        throw new ServiceError(
          "Invalid admin passkey",
          StatusCodes.BAD_REQUEST
        );
      }
      logger.info(`Admin passkey verified`);
      return true;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error verifying admin passkey: ${err.message}`);
      throw error instanceof ServiceError
        ? error
        : new ServiceError(
            "Failed to verify admin passkey",
            StatusCodes.INTERNAL_SERVER_ERROR,
            err
          );
    }
  };

  public checkProfileCompletion = async (userId: string): Promise<boolean> => {
    try {
      const user = await this._userRepository.findById(userId);
      if (!user) {
        throw new ServiceError("User not found", StatusCodes.NOT_FOUND);
      }
      const isComplete = await this._userRepository.isProfileComplete(user);
      logger.info(
        `Profile completion checked for user ${userId}: ${isComplete}`
      );
      return isComplete;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(
        `Error checking profile completion for user ${userId}: ${err.message}`
      );
      throw error instanceof ServiceError
        ? error
        : new ServiceError(
            "Failed to check profile completion",
            StatusCodes.INTERNAL_SERVER_ERROR,
            err
          );
    }
  };

  public profileDetails = async (userId: string): Promise<IUserDTO | null> => {
    try {
      const user = await this._userRepository.findById(userId);
      logger.info(`Fetched profile details for user ${userId}`);
      return toUserDTO(user);
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(
        `Error fetching profile details for user ${userId}: ${err.message}`
      );
      throw error instanceof ServiceError
        ? error
        : new ServiceError(
            "Failed to fetch profile details",
            StatusCodes.INTERNAL_SERVER_ERROR,
            err
          );
    }
  };

  updateUserProfile = async (
    userId: string,
    data: ProfileUpdateData
  ): Promise<IUserDTO> => {
    try {
      const user = await this._userRepository.findById(userId);
      if (!user) {
        throw new ServiceError("User not found", StatusCodes.NOT_FOUND);
      }
      let profilePic = user.profilePic ?? undefined;
      let coverPic = user.coverPic ?? undefined;
      if (data.profilePicFile) {
        const { publicId } = await uploadMedia(
          data.profilePicFile.path,
          "profiles",
          data.profilePicFile.size
        );
        profilePic = publicId;
      }
      if (data.coverPicFile) {
        const { publicId } = await uploadMedia(
          data.coverPicFile.path,
          "covers",
          data.coverPicFile.size
        );
        coverPic = publicId
      }
      const updatedData: Partial<IUser> = {
        name: data.name ?? user.name,
        email: data.email ?? user.email,
        phone: data.phone ?? user.phone,
        dateOfBirth: data.dateOfBirth
          ? new Date(data.dateOfBirth)
          : user.dateOfBirth,
        jobTitle: data.jobTitle ?? user.jobTitle,
        industry: data.industry ?? user.industry,
        reasonForJoining: data.reasonForJoining ?? user.reasonForJoining,
        profilePic,
        coverPic,
      };
      const updatedUser = await this._userRepository.update(userId, updatedData);
      if (!updatedUser) {
        throw new ServiceError(
          "Failed to update user profile",
          StatusCodes.INTERNAL_SERVER_ERROR
        );
      }
      logger.info(`Updated profile for user ${userId}`);
      return toUserDTO(updatedUser)!;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error updating profile for user ${userId}: ${err.message}`);
      throw error instanceof ServiceError
        ? error
        : new ServiceError(
            "Failed to update user profile",
            StatusCodes.INTERNAL_SERVER_ERROR,
            err
          );
    }
  };

  updatePassword = async (
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<IUserDTO> => {
    try {
      const user = await this._userRepository.findById(userId);
      if (!user) {
        throw new ServiceError("Cannot Update password", StatusCodes.NOT_FOUND);
      }
      if (!user.password) {
        throw new ServiceError(
          "Cannot update Password",
          StatusCodes.BAD_REQUEST
        );
      }

      // Verify current password
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        throw new ServiceError(
          "Current password is incorrect",
          StatusCodes.BAD_REQUEST
        );
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      const updatedUser = await this._userRepository.update(userId, {
        password: hashedPassword,
      });
      if (!updatedUser) {
        throw new ServiceError(
          "Failed to update password",
          StatusCodes.INTERNAL_SERVER_ERROR
        );
      }

      logger.info(`Updated password for user ${userId}`);
      return toUserDTO(updatedUser)!;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(
        `Error updating password for user ${userId}: ${err.message}`
      );
      throw error instanceof ServiceError
        ? error
        : new ServiceError(
            "Failed to update password",
            StatusCodes.INTERNAL_SERVER_ERROR,
            err
          );
    }
  };

  fetchAllUsers = async (): Promise<IUserDTO[]> => {
    try {
      const users =  await this._userRepository.fetchAllUsers();
      return toUserDTOs(users)!;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error in fetchAllUsers: ${err.message}`);
      throw new ServiceError(
        "Failed to fetch all users",
        StatusCodes.INTERNAL_SERVER_ERROR,
        err
      );
    }
  };

  getAllUsers = async (
    query: UserQuery = {}
  ): Promise<{ users: IUserDTO[]; total: number }> => {
    try {
      logger.debug(`Fetching all users with query: ${JSON.stringify(query)}`);
      const { users, total } = await this._userRepository.getAllUsers(query);
      return { users: toUserDTOs(users), total };
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error fetching all users: ${err.message}`);
      throw error instanceof ServiceError
        ? error
        : new ServiceError(
            "Failed to fetch all users",
            StatusCodes.INTERNAL_SERVER_ERROR,
            err
          );
    }
  };

  blockUser = async (id: string): Promise<void> => {
    try {
      const user = await this._userRepository.getUserById(id);
      if (!user) {
        throw new ServiceError("User not found", StatusCodes.NOT_FOUND);
      }
      await this._userRepository.blockUser(id);
      logger.info(`Blocked user: ${id}`);
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error blocking user ${id}: ${err.message}`);
      throw error instanceof ServiceError
        ? error
        : new ServiceError(
            `Failed to block user ${id}`,
            StatusCodes.INTERNAL_SERVER_ERROR,
            err
          );
    }
  };

  unblockUser = async (id: string): Promise<void> => {
    try {
      const user = await this._userRepository.getUserById(id);
      if (!user) {
        throw new ServiceError("User not found", StatusCodes.NOT_FOUND);
      }
      await this._userRepository.unblockUser(id);
      logger.info(`Unblocked user: ${id}`);
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error unblocking user ${id}: ${err.message}`);
      throw error instanceof ServiceError
        ? error
        : new ServiceError(
            `Failed to unblock user ${id}`,
            StatusCodes.INTERNAL_SERVER_ERROR,
            err
          );
    }
  };

  changeRole = async (userId: string, role: string): Promise<IUserDTO | null> => {
    try {
      const user = await this._userRepository.getUserById(userId);
      if (!user) {
        throw new ServiceError("User not found", StatusCodes.NOT_FOUND);
      }
      const updatedUser = await this._userRepository.updateUserRole(
        userId,
        role
      );
      if (!updatedUser) {
        throw new ServiceError(
          "Failed to update user role",
          StatusCodes.INTERNAL_SERVER_ERROR
        );
      }
      logger.info(`Updated role for user ${userId} to ${role}`);
      return toUserDTO(updatedUser)!;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error updating role for user ${userId}: ${err.message}`);
      throw error instanceof ServiceError
        ? error
        : new ServiceError(
            `Failed to update role for user ${userId}`,
            StatusCodes.INTERNAL_SERVER_ERROR,
            err
          );
    }
  }

  public getAllUsersAdmin = async (
  query: UserQuery = {}
): Promise<{ users: IUserAdminDTO[]; total: number }> => {
  try {
    logger.debug(`Fetching all users for admin with query: ${JSON.stringify(query)}`);
    const { users, total } = await this._userRepository.getAllUsers(query);
    return { users: toUserAdminDTOs(users), total };
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error(`Error fetching all users for admin: ${err.message}`);
    throw error instanceof ServiceError
      ? error
      : new ServiceError(
          'Failed to fetch all users for admin',
          StatusCodes.INTERNAL_SERVER_ERROR,
          err
        );
  }
};
}
