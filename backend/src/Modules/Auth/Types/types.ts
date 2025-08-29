import { UserInterface as IUser } from '../../../Interfaces/models/IUser.js';

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
  email: string;
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

//Interface for Quesry for User Retrievel
export interface UserQuery {
  search?: string;
  page?: number;
  limit?: number;
  role?:string;
  excludeId?: string;
}

//Upadte Password 
export interface UpdatePasswordRequestBody {
  currentPassword: string;
  newPassword: string;
}