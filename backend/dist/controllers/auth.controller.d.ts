import { Request, Response } from "express";
export declare const registerPersonalDetails: (req: Request, res: Response) => Promise<void>;
export declare const registerAccountDetails: (req: Request, res: Response) => Promise<void>;
export declare const registerProfessionalDetails: (req: Request, res: Response) => Promise<void>;
export declare const registerReasonAndRole: (req: Request, res: Response) => Promise<void>;
export declare const login: (req: Request, res: Response) => Promise<void>;
export declare const refreshToken: (req: Request, res: Response) => Promise<void>;
export declare const logout: (req: Request, res: Response) => Promise<void>;
export declare const handleForgotPassword: (req: Request, res: Response) => Promise<void>;
export declare const handleVerifyOTP: (req: Request, res: Response) => Promise<void>;
export declare const handleResetPassword: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=auth.controller.d.ts.map