import { UserInterface as IUser } from '../../../Interfaces/models/IUser.js';
export interface SignupRequestBody {
    name: string;
    email: string;
    password: string;
}
export interface LoginRequestBody {
    email: string;
    password: string;
}
export interface OAuthRequestBody {
    code: string;
}
export interface RefreshTokenRequestBody {
    refreshToken: string;
}
export interface ForgotPasswordRequestBody {
    email: string;
}
export interface VerifyOTPRequestBody {
    email: string;
    otp: string;
}
export interface ResetPasswordRequestBody {
    email: string;
    newPassword: string;
}
export interface LogoutRequestBody {
    email: string;
}
export interface VerifyPasskeyRequestBody {
    passkey: string;
}
export interface UpdateProfileRequestBody extends Partial<IUser> {
    profilePicFile?: Express.Multer.File;
    coverPicFile?: Express.Multer.File;
}
export interface SignupData {
    name: string;
    email: string;
    password: string;
}
export interface ProfileUpdateData extends Partial<IUser> {
    profilePicFile?: Express.Multer.File;
    coverPicFile?: Express.Multer.File;
}
//# sourceMappingURL=types.d.ts.map