import { Request, Response } from "express";
export declare const signup: (req: Request, res: Response) => Promise<void>;
export declare const login: (req: Request, res: Response) => Promise<void>;
export declare const refreshToken: (req: Request, res: Response) => Promise<void>;
export declare const googleAuthRedirect: (req: Request, res: Response) => void;
export declare const githubAuthRedirect: (req: Request, res: Response) => void;
export declare const logout: (req: Request, res: Response) => Promise<void>;
export declare const handleForgotPassword: (req: Request, res: Response) => Promise<void>;
export declare const handleVerifyOTP: (req: Request, res: Response) => Promise<void>;
export declare const handleResetPassword: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=auth.controller.d.ts.map