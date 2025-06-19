import { BaseController } from './../../../core/Controller/BaseController.js';
import { Request, Response } from 'express';
import { UserInterface as IUser } from '../../../Interfaces/models/IUser.js';
interface SignupRequestBody {
    name: string;
    email: string;
    password: string;
}
interface LoginRequestBody {
    email: string;
    password: string;
}
interface OAuthRequestBody {
    code: string;
}
interface RefreshTokenRequestBody {
    refreshToken: string;
}
interface ForgotPasswordRequestBody {
    email: string;
}
interface VerifyOTPRequestBody {
    email: string;
    otp: string;
}
interface ResetPasswordRequestBody {
    email: string;
    newPassword: string;
}
interface LogoutRequestBody {
    email: string;
}
interface VerifyPasskeyRequestBody {
    passkey: string;
}
interface UpdateProfileRequestBody extends Partial<IUser> {
    profilePicFile?: Express.Multer.File;
    coverPicFile?: Express.Multer.File;
}
export declare class AuthController extends BaseController {
    private authService;
    private jwtService;
    constructor();
    signup(req: Request<{}, {}, SignupRequestBody>, res: Response): Promise<void>;
    login(req: Request<{}, {}, LoginRequestBody>, res: Response): Promise<void>;
    googleSignup(req: Request<{}, {}, OAuthRequestBody>, res: Response): Promise<void>;
    googleLogin(req: Request<{}, {}, OAuthRequestBody>, res: Response): Promise<void>;
    githubSignup(req: Request<{}, {}, OAuthRequestBody>, res: Response): Promise<void>;
    githubLogin(req: Request<{}, {}, OAuthRequestBody>, res: Response): Promise<void>;
    refreshToken(req: Request<{}, {}, RefreshTokenRequestBody>, res: Response): Promise<void>;
    checkProfile(req: Request<{
        id: string;
    }>, res: Response): Promise<void>;
    getProfileDetails(req: Request<{
        id: string;
    }>, res: Response): Promise<void>;
    updateUserDetails(req: Request<{
        id: string;
    }, {}, UpdateProfileRequestBody>, res: Response): Promise<void>;
    logout(req: Request<{}, {}, LogoutRequestBody>, res: Response): Promise<void>;
    handleForgotPassword(req: Request<{}, {}, ForgotPasswordRequestBody>, res: Response): Promise<void>;
    handleVerifyOTP(req: Request<{}, {}, VerifyOTPRequestBody>, res: Response): Promise<void>;
    handleResetPassword(req: Request<{}, {}, ResetPasswordRequestBody>, res: Response): Promise<void>;
    verifyPasskey(req: Request<{}, {}, VerifyPasskeyRequestBody>, res: Response): Promise<void>;
    getAllUsers(_req: Request, res: Response): Promise<void>;
    getUserById(req: Request<{
        id: string;
    }>, res: Response): Promise<void>;
    blockUser(req: Request<{
        id: string;
    }>, res: Response): Promise<void>;
    unblockUser(req: Request<{
        id: string;
    }>, res: Response): Promise<void>;
    changeRole(req: Request<{
        id: string;
    }, {}, {
        role: string;
    }>, res: Response): Promise<void>;
}
export {};
//# sourceMappingURL=AuthController.d.ts.map