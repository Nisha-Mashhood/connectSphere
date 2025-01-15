import { Request, Response } from "express";
export declare const signup: (req: Request, res: Response) => Promise<void>;
export declare const login: (req: Request, res: Response) => Promise<void>;
export declare const googleSignup: (req: Request, res: Response) => Promise<void>;
export declare const googleLogin: (req: Request, res: Response) => Promise<void>;
export declare const refreshToken: (req: Request, res: Response) => Promise<void>;
export declare const checkProfile: (req: Request, res: Response) => Promise<void>;
export declare const getprofileDetails: (req: Request, res: Response) => Promise<void>;
export declare const updateUserDetails: (req: Request, res: Response) => Promise<void>;
export declare const googleAuthRedirect: (req: Request, res: Response) => void;
export declare const githubAuthRedirect: (req: Request, res: Response) => void;
export declare const logout: (req: Request, res: Response) => Promise<void>;
export declare const handleForgotPassword: (req: Request, res: Response) => Promise<void>;
export declare const handleVerifyOTP: (req: Request, res: Response) => Promise<void>;
export declare const handleResetPassword: (req: Request, res: Response) => Promise<void>;
export declare const verifyPasskey: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=auth.controller.d.ts.map