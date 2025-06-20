import { BaseService } from "../../../core/Services/BaseService.js";
import { ServiceError } from "../../../core/Utils/ErrorHandler.js";
import { UserRepository } from "../Repositry/UserRepositry.js";
import { UserInterface as IUser } from "../../../Interfaces/models/IUser.js";
import bcrypt from "bcryptjs";
import { AuthService as JWTService } from "../Utils/JWT.js"
import { generateOTP } from "../Utils/OTP.js";
import { sendEmail } from "../../../core/Utils/Email.js";
import config from "../../../config/env.config.js";
import { uploadMedia } from "../../../core/Utils/Cloudinary.js";
import { OAuth2Client } from "../Utils/GoogleConfig.js";
import axios from "axios";
import logger from "../../../core/Utils/Logger.js";

// Interface for signup data
interface SignupData {
  name: string;
  email: string;
  password: string;
}

// Interface for profile update data
interface ProfileUpdateData extends Partial<IUser> {
  profilePicFile?: Express.Multer.File;
  coverPicFile?: Express.Multer.File;
}

// Temporary OTP storage (replace with Redis in production)
const otpStore: Record<string, string> = {};

// Service for authentication and user profile operations
export class AuthService extends BaseService {
  private userRepository: UserRepository;
  private jwtservice = new JWTService();

  constructor() {
    super();
    this.userRepository = new UserRepository();
    this.jwtservice = new JWTService();
  }

  //  user signup
   signup = async(data: SignupData): Promise<IUser> =>{
    try {
      const { name, email, password } = data;
      const userExists = await this.userRepository.findUserByEmail(email);
      if (userExists) {
        throw new ServiceError("User already exists");
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      return await this.userRepository.createUser({
        name,
        email,
        password: hashedPassword,
      });
    } catch (error) {
      logger.error(`Error in signup for email ${data.email}: ${error}`);
      throw error instanceof ServiceError
        ? error
        : new ServiceError("Failed to signup user");
    }
  }

  //  user login
   login = async(
    email: string,
    password: string
  ): Promise<{
    user: IUser;
    accessToken: string;
    refreshToken: string;
    needsReviewPrompt: boolean;
  }> =>{
    try {
      const user = await this.userRepository.findUserByEmail(email);
      if (!user) {
        throw new ServiceError("User not found");
      }
      if (user.isBlocked) {
        throw new ServiceError("Blocked");
      }
      if (!user.password) {
        throw new ServiceError(
          "This account is registered using a third-party provider. Please log in with your provider"
        );
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        throw new ServiceError("Invalid credentials");
      }
      await this.userRepository.incrementLoginCount(user._id.toString());
      const updatedUser = await this.userRepository.findById(
        user._id.toString()
      );
      if (!updatedUser) {
        throw new ServiceError("User not found after login count update");
      }
      const accessToken = this.jwtservice.generateAccessToken({
        userId: user._id,
        userRole: user.role,
      });
      const refreshToken = this.jwtservice.generateRefreshToken({
        userId: user._id,
        userRole: user.role,
      });
      await this.userRepository.updateRefreshToken(
        user._id.toString(),
        refreshToken
      );
      const needsReviewPrompt =
        updatedUser.loginCount >= 5 && !updatedUser.hasReviewed;
      logger.info(
        `User ${email} logged in. loginCount: ${updatedUser.loginCount}, needsReviewPrompt: ${needsReviewPrompt}`
      );
      return {
        user: updatedUser,
        accessToken,
        refreshToken,
        needsReviewPrompt,
      };
    } catch (error) {
      logger.error(`Error in login for email ${email}: ${error}`);
      throw error instanceof ServiceError
        ? error
        : new ServiceError("Failed to login user");
    }
  }

  //  Google signup
   googleSignup = async(code: string): Promise<IUser> =>{
    try {
      const { tokens } = await OAuth2Client.getToken(code);
      OAuth2Client.setCredentials(tokens);
      const userRes = await axios.get(
        `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${tokens.access_token}`
      );
      const { email, name, picture } = userRes.data;
      const existingUser = await this.userRepository.findUserByEmail(email);
      if (existingUser) {
        throw new ServiceError("Email already registered");
      }
      return await this.userRepository.createUser({
        name,
        email,
        provider: "google",
        providerId: tokens.id_token,
        profilePic: picture,
        password: null,
      });
    } catch (error) {
      logger.error(`Error in Google signup: ${error}`);
      throw error instanceof ServiceError
        ? error
        : new ServiceError("Google signup failed");
    }
  }

  //  Google login
   googleLogin = async(
    code: string
  ): Promise<{
    user: IUser;
    accessToken: string;
    refreshToken: string;
    needsReviewPrompt: boolean;
  }> =>{
    try {
      const { tokens } = await OAuth2Client.getToken(code);
      OAuth2Client.setCredentials(tokens);
      const userRes = await axios.get(
        `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${tokens.access_token}`
      );
      const { email } = userRes.data;
      const existingUser = await this.userRepository.findUserByEmail(email);
      if (!existingUser) {
        throw new ServiceError("Email not registered");
      }
      await this.userRepository.incrementLoginCount(
        existingUser._id.toString()
      );
      const updatedUser = await this.userRepository.findById(
        existingUser._id.toString()
      );
      if (!updatedUser) {
        throw new ServiceError("User not found after login count update");
      }
      const accessToken = this.jwtservice.generateAccessToken({
        userId: existingUser._id,
        userRole: existingUser.role,
      });
      const refreshToken = this.jwtservice.generateRefreshToken({
        userId: existingUser._id,
        userRole: existingUser.role,
      });
      await this.userRepository.updateRefreshToken(
        existingUser._id.toString(),
        refreshToken
      );
      const needsReviewPrompt =
        updatedUser.loginCount >= 5 && !updatedUser.hasReviewed;
      logger.info(
        `Google login for ${email}. loginCount: ${updatedUser.loginCount}, needsReviewPrompt: ${needsReviewPrompt}`
      );
      return {
        user: updatedUser,
        accessToken,
        refreshToken,
        needsReviewPrompt,
      };
    } catch (error) {
      logger.error(`Error in Google login: ${error}`);
      throw error instanceof ServiceError
        ? error
        : new ServiceError("Google login failed");
    }
  }

  //  GitHub signup
   githubSignup = async(code: string): Promise<IUser> =>{
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
          throw new ServiceError("Email not found for GitHub user");
        }
        email = primaryEmail.email;
      }
      const existingUser = await this.userRepository.findUserByEmail(email);
      if (existingUser) {
        throw new ServiceError("Email already registered");
      }
      return await this.userRepository.createUser({
        name: userResponse.data.name || userResponse.data.login,
        email,
        provider: "github",
        providerId: userResponse.data.login,
        profilePic: userResponse.data.avatar_url,
        password: null,
      });
    } catch (error) {
      logger.error(`Error in GitHub signup: ${error}`);
      throw error instanceof ServiceError
        ? error
        : new ServiceError("GitHub signup failed");
    }
  }

  //  GitHub login
   githubLogin = async(
    code: string
  ): Promise<{
    user: IUser;
    accessToken: string;
    refreshToken: string;
    needsReviewPrompt: boolean;
  }> =>{
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
          throw new ServiceError("Email not found for GitHub user");
        }
        email = primaryEmail.email;
      }
      const existingUser = await this.userRepository.findUserByEmail(email);
      if (!existingUser) {
        throw new ServiceError("Email not registered");
      }
      await this.userRepository.incrementLoginCount(
        existingUser._id.toString()
      );
      const updatedUser = await this.userRepository.findById(
        existingUser._id.toString()
      );
      if (!updatedUser) {
        throw new ServiceError("User not found after login count update");
      }
      const accessToken = this.jwtservice.generateAccessToken({
        userId: existingUser._id,
        userRole: existingUser.role,
      });
      const refreshToken = this.jwtservice.generateRefreshToken({
        userId: existingUser._id,
        userRole: existingUser.role,
      });
      await this.userRepository.updateRefreshToken(
        existingUser._id.toString(),
        refreshToken
      );
      const needsReviewPrompt =
        updatedUser.loginCount >= 5 && !updatedUser.hasReviewed;
      logger.info(
        `GitHub login for ${email}. loginCount: ${updatedUser.loginCount}, needsReviewPrompt: ${needsReviewPrompt}`
      );
      return {
        user: updatedUser,
        accessToken,
        refreshToken,
        needsReviewPrompt,
      };
    } catch (error) {
      logger.error(`Error in GitHub login: ${error}`);
      throw error instanceof ServiceError
        ? error
        : new ServiceError("GitHub login failed");
    }
  }

  //  refresh token
   refreshToken = async(
    refreshToken: string
  ): Promise<{ newAccessToken: string }> =>{
    try {
      const decoded = this.jwtservice.verifyRefreshToken(refreshToken);
      const newAccessToken = this.jwtservice.generateAccessToken({ userId: decoded.userId });
      logger.info(`Refreshed access token for userId: ${decoded.userId}`);
      return { newAccessToken };
    } catch (error) {
      logger.error(`Error refreshing token: ${error}`);
      throw new ServiceError("Invalid or expired refresh token");
    }
  }

  //  forgot password
   forgotPassword = async(email: string): Promise<string> =>{
    try {
      const user = await this.userRepository.findUserByEmail(email);
      if (!user) {
        throw new ServiceError("User not found");
      }
      const otp = generateOTP();
      otpStore[email] = otp;
      await sendEmail(email, "Password Reset OTP", `Your OTP is ${otp}`);
      logger.info(`Sent OTP to ${email}`);
      return otp; // Remove in production
    } catch (error) {
      logger.error(`Error in forgot password for ${email}: ${error}`);
      throw error instanceof ServiceError
        ? error
        : new ServiceError("Failed to send OTP");
    }
  }

  //  verify OTP
   verifyOTP = async(email: string, otp: string): Promise<string> =>{
    try {
      if (otpStore[email] !== otp) {
        throw new ServiceError("Invalid or expired OTP");
      }
      delete otpStore[email];
      const token = this.jwtservice.generateAccessToken({ email }, "10m");
      logger.info(`OTP verified for ${email}`);
      return token;
    } catch (error) {
      logger.error(`Error verifying OTP for ${email}: ${error}`);
      throw error instanceof ServiceError
        ? error
        : new ServiceError("Failed to verify OTP");
    }
  }

  //  reset password
   resetPassword = async(email: string, newPassword: string): Promise<void> =>{
    try {
      const user = await this.userRepository.findUserByEmail(email);
      if (!user) {
        throw new ServiceError("User not found");
      }
      if (user.password && (await bcrypt.compare(newPassword, user.password))) {
        throw new ServiceError(
          "New password cannot be the same as the old password"
        );
      }
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await this.userRepository.updatePassword(
        user._id.toString(),
        hashedPassword
      );
      logger.info(`Password reset for ${email}`);
    } catch (error) {
      logger.error(`Error resetting password for ${email}: ${error}`);
      throw error instanceof ServiceError
        ? error
        : new ServiceError("Failed to reset password");
    }
  }

  //  logout
   logout = async(email: string): Promise<void> =>{
    try {
      await this.userRepository.removeRefreshToken(email);
      logger.info(`User ${email} logged out`);
    } catch (error) {
      logger.error(`Error logging out user ${email}: ${error}`);
      throw new ServiceError("Failed to logout user");
    }
  }

  // Verify admin passkey
   verifyAdminPasskey = async(passkey: string): Promise<boolean> => {
    try {
      if (passkey !== config.adminpasscode) {
        throw new ServiceError("Invalid admin passkey");
      }
      logger.info(`Admin passkey verified`);
      return true;
    } catch (error) {
      logger.error(`Error verifying admin passkey: ${error}`);
      throw error instanceof ServiceError
        ? error
        : new ServiceError("Failed to verify admin passkey");
    }
  }

  // Check profile completion
   checkProfileCompletion = async(userId: string): Promise<boolean> => {
    try {
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new ServiceError("User not found");
      }
      const isComplete = await this.userRepository.isProfileComplete(user);
      logger.info(
        `Profile completion checked for user ${userId}: ${isComplete}`
      );
      return isComplete;
    } catch (error) {
      logger.error(
        `Error checking profile completion for user ${userId}: ${error}`
      );
      throw error instanceof ServiceError
        ? error
        : new ServiceError("Failed to check profile completion");
    }
  }

  // Get profile details
   profileDetails = async(userId: string): Promise<IUser> => {
    try {
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new ServiceError("User not found");
      }
      logger.info(`Fetched profile details for user ${userId}`);
      return user;
    } catch (error) {
      logger.error(
        `Error fetching profile details for user ${userId}: ${error}`
      );
      throw error instanceof ServiceError
        ? error
        : new ServiceError("Failed to fetch profile details");
    }
  }

  // Update user profile
   updateUserProfile = async(
    userId: string,
    data: ProfileUpdateData
  ): Promise<IUser> => {
    try {
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new ServiceError("User not found");
      }
      let profilePic = user.profilePic;
      let coverPic = user.coverPic;
      if (data.profilePicFile) {
        const { url } = await uploadMedia(
          data.profilePicFile.path,
          "profiles",
          data.profilePicFile.size
        );
        profilePic = url;
      }
      if (data.coverPicFile) {
        const { url } = await uploadMedia(
          data.coverPicFile.path,
          "covers",
          data.coverPicFile.size
        );
        coverPic = url;
      }
      const updatedData: Partial<IUser> = {
        name: data.name || user.name,
        email: data.email || user.email,
        phone: data.phone || user.phone,
        dateOfBirth: data.dateOfBirth
          ? new Date(data.dateOfBirth)
          : user.dateOfBirth,
        jobTitle: data.jobTitle || user.jobTitle,
        industry: data.industry || user.industry,
        reasonForJoining: data.reasonForJoining || user.reasonForJoining,
        profilePic,
        coverPic,
      };
      const updatedUser = await this.userRepository.update(userId, updatedData);
      if (!updatedUser) {
        throw new ServiceError("Failed to update user profile");
      }
      logger.info(`Updated profile for user ${userId}`);
      return updatedUser;
    } catch (error) {
      logger.error(`Error updating profile for user ${userId}: ${error}`);
      throw error instanceof ServiceError
        ? error
        : new ServiceError("Failed to update user profile");
    }
  }

  //get All User Details
   getAllUsers = async(): Promise<IUser[]> => {
    try {
      logger.debug(`Fetching all users`);
      return await this.userRepository.getAllUsers();
    } catch (error) {
      logger.error(`Error fetching all users: ${error}`);
      throw error instanceof ServiceError
        ? error
        : new ServiceError("Failed to fetch all users");
    }
  }

  //block the given user
   blockUser = async(id: string): Promise<void> => {
    try {
      this.checkData(id);
      const user = await this.userRepository.getUserById(id);
      if (!user) {
        this.throwError("User not found");
      }
      await this.userRepository.blockUser(id);
      logger.info(`Blocked user: ${id}`);
    } catch (error) {
      logger.error(`Error blocking user ${id}: ${error}`);
      throw error instanceof ServiceError
        ? error
        : new ServiceError(`Failed to block user ${id}`);
    }
  }

  //Unblock the given User
   unblockUser = async(id: string): Promise<void> => {
    try {
      this.checkData(id);
      const user = await this.userRepository.getUserById(id);
      if (!user) {
        this.throwError("User not found");
      }
      await this.userRepository.unblockUser(id);
      logger.info(`Unblocked user: ${id}`);
    } catch (error) {
      logger.error(`Error unblocking user ${id}: ${error}`);
      throw error instanceof ServiceError
        ? error
        : new ServiceError(`Failed to unblock user ${id}`);
    }
  }

  //Change the user Role
   changeRole = async(userId: string, role: string): Promise<IUser | null> => {
    try {
      this.checkData({ userId, role });
      const user = await this.userRepository.getUserById(userId);
      if (!user) {
        this.throwError("User not found");
      }
      const updatedUser = await this.userRepository.updateUserRole(
        userId,
        role
      );
      if (!updatedUser) {
        this.throwError("Failed to update user role");
      }
      logger.info(`Updated role for user ${userId} to ${role}`);
      return updatedUser;
    } catch (error) {
      logger.error(`Error updating role for user ${userId}: ${error}`);
      throw error instanceof ServiceError
        ? error
        : new ServiceError(`Failed to update role for user ${userId}`);
    }
  }
}
