import { ProfileUpdateData, SignupData, UserQuery } from "../../Utils/Types/auth-types";
import { IUserAdminDTO, IUserDTO } from "../DTOs/i-user-dto";

export interface IAuthService {
  signup: (data: SignupData) => Promise<IUserDTO>;
  login: (email: string, password: string) => Promise<{ user: IUserDTO; accessToken: string; refreshToken: string; needsReviewPrompt: boolean }>;
  googleSignup: (code: string) => Promise<IUserDTO>;
  googleLogin: (code: string) => Promise<{ user: IUserDTO; accessToken: string; refreshToken: string; needsReviewPrompt: boolean }>;
  githubSignup: (code: string) => Promise<IUserDTO>;
  githubLogin: (code: string) => Promise<{ user: IUserDTO; accessToken: string; refreshToken: string; needsReviewPrompt: boolean }>;
  refreshToken: (refreshToken: string) => Promise<{ newAccessToken: string }>;
  forgotPassword: (email: string) => Promise<string>;
  verifyOTP: (email: string, otp: string) => Promise<string>;
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