import { BaseService } from "../../../core/Services/BaseService.js";
import { UserInterface as IUser } from "../../../Interfaces/models/IUser.js";
interface SignupData {
    name: string;
    email: string;
    password: string;
}
interface ProfileUpdateData extends Partial<IUser> {
    profilePicFile?: Express.Multer.File;
    coverPicFile?: Express.Multer.File;
}
export declare class AuthService extends BaseService {
    private userRepository;
    private jwtservice;
    constructor();
    signup: (data: SignupData) => Promise<IUser>;
    login: (email: string, password: string) => Promise<{
        user: IUser;
        accessToken: string;
        refreshToken: string;
        needsReviewPrompt: boolean;
    }>;
    googleSignup: (code: string) => Promise<IUser>;
    googleLogin: (code: string) => Promise<{
        user: IUser;
        accessToken: string;
        refreshToken: string;
        needsReviewPrompt: boolean;
    }>;
    githubSignup: (code: string) => Promise<IUser>;
    githubLogin: (code: string) => Promise<{
        user: IUser;
        accessToken: string;
        refreshToken: string;
        needsReviewPrompt: boolean;
    }>;
    refreshToken: (refreshToken: string) => Promise<{
        newAccessToken: string;
    }>;
    forgotPassword: (email: string) => Promise<string>;
    verifyOTP: (email: string, otp: string) => Promise<string>;
    resetPassword: (email: string, newPassword: string) => Promise<void>;
    logout: (email: string) => Promise<void>;
    verifyAdminPasskey: (passkey: string) => Promise<boolean>;
    checkProfileCompletion: (userId: string) => Promise<boolean>;
    profileDetails: (userId: string) => Promise<IUser>;
    updateUserProfile: (userId: string, data: ProfileUpdateData) => Promise<IUser>;
    getAllUsers: () => Promise<IUser[]>;
    blockUser: (id: string) => Promise<void>;
    unblockUser: (id: string) => Promise<void>;
    changeRole: (userId: string, role: string) => Promise<IUser | null>;
}
export {};
//# sourceMappingURL=AuthService.d.ts.map