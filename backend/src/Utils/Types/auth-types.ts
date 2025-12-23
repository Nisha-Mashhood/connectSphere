import { IUserDTO } from '../../Interfaces/DTOs/i-user-dto';
import { IUser } from '../../Interfaces/Models/i-user';
import type { Express } from "express";

//Types for controller file 

// Interface for signup request body
export interface SignupRequestBody {
  name: string;
  email: string;
  password: string;
}

// Interface for login request body
export interface LoginRequestBody {
  email: string;
  password: string;
}

// Interface for OAuth request body
export interface OAuthRequestBody {
  code: string;
}

// Interface for refresh token request body
export interface RefreshTokenRequestBody {
  refreshToken: string;
}

// Interface for forgot password request body
export interface ForgotPasswordRequestBody {
  email: string;
}

// Interface for verify OTP request body
export interface VerifyOTPRequestBody {
  purpose: OtpPurpose,
  email: string;
  otpId: string,
  otp: string;
}

// Interface for reset password request body
export interface ResetPasswordRequestBody {
  email: string;
  newPassword: string;
}

// Interface for logout request body
export interface LogoutRequestBody {
  email: string;
}

// Interface for verify passkey request body
export interface VerifyPasskeyRequestBody {
  passkey: string;
}

// Interface for update profile request body
export interface UpdateProfileRequestBody extends Partial<IUser> {
  profilePicFile?: Express.Multer.File;
  coverPicFile?: Express.Multer.File;
}


//Types for service file

// Interface for signup data
export interface SignupData {
  name: string;
  email: string;
  password: string;
}

// Interface for profile update data
export interface ProfileUpdateData extends Partial<IUser> {
  profilePicFile?: Express.Multer.File;
  coverPicFile?: Express.Multer.File;
}

//Interface for Query for User Retrievel
export type UserQuery = {
  search?: string;
  sortField?: 'industry' | 'reasonForJoining' | 'hasReviewed';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  excludeId?: string;
  status?: string;
};

//Upadte Password 
export interface UpdatePasswordRequestBody {
  currentPassword: string;
  newPassword: string;
}

 //OTP types
export type OtpPurpose =
  | "signup"
  | "login"
  | "forgot-password"
  | "google-login"
  | "github-login"
  | "forgot_password";

//OTP structure stored in Redis
export interface OtpRedisPayload {
  otp: string;
  email: string;
  purpose: OtpPurpose;
  attempts: number;
  createdAt: number;
}

//structure for sending OTP
export interface SendOtpParams {
  email: string;
  purpose: OtpPurpose;
  emailSubject: string;
  emailBody: (otp: string) => string;
  ttlSeconds?: number;
}

export interface VerifyOtpLoginResult {
  purpose: "login";
  user: IUserDTO;
  accessToken: string;
  refreshToken: string;
  needsReviewPrompt: boolean;
}

export interface VerifyOtpGenericResult {
  purpose: Exclude<OtpPurpose, "login">;
  email: string;
}

export type VerifyOtpResult =
  | VerifyOtpLoginResult
  | VerifyOtpGenericResult;