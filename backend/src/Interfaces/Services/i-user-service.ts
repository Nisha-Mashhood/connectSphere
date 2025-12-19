import { OtpPurpose, ProfileUpdateData, SignupData, UserQuery, VerifyOtpResult } from "../../Utils/types/auth-types";
import { IUserAdminDTO, IUserDTO } from "../DTOs/i-user-dto";

export interface IAuthService {
  signup: (data: SignupData) => Promise<{user:IUserDTO; otpId:string}>;
  login: (email: string, password: string) => Promise<{ user: IUserDTO; otpId:string }>;
  googleSignup: (code: string) => Promise<{user:IUserDTO; otpId:string}>;
  googleLogin: (code: string) => Promise<{ user: IUserDTO; otpId:string }>;
  githubSignup: (code: string) => Promise<{user:IUserDTO; otpId:string}>;
  githubLogin: (code: string) => Promise<{ user: IUserDTO; otpId:string }>;
  refreshToken: (refreshToken: string) => Promise<{ newAccessToken: string }>;
  forgotPassword: (email: string) => Promise<string>;
  verifyOTP: (purpose:OtpPurpose, email:string, otpId: string, otp: string) => Promise<VerifyOtpResult>;
  resendOtp: (email: string, purpose:OtpPurpose) => Promise<{ otpId: string }>;
  resetPassword: (email: string, newPassword: string) => Promise<void>;
  logout: (email: string) => Promise<void>;
  verifyAdminPasskey: (passkey: string) => Promise<boolean>;
  checkProfileCompletion: (userId: string) => Promise<boolean>;
  profileDetails: (userId: string) => Promise<IUserDTO | null>;
  updateUserProfile: (userId: string, data: ProfileUpdateData) => Promise<IUserDTO>;
  updatePassword: (userId: string, currentPassword: string, newPassword: string) => Promise<IUserDTO>;
  fetchAllUsers: () => Promise<IUserDTO[]>;
  getAllUsers: (query: UserQuery) => Promise<{ users: IUserDTO[]; total: number }>;
  blockUser: (id: string) => Promise<void>;
  unblockUser: (id: string) => Promise<void>;
  changeRole: (userId: string, role: string) => Promise<IUserDTO | null>;
  getAllUsersAdmin(query?: UserQuery): Promise<{ users: IUserAdminDTO[]; total: number }>;
}