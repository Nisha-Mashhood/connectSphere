import { Response } from "express";
interface JwtPayload {
    [key: string]: any;
}
export declare const generateAccessToken: (payload: JwtPayload, expiresIn?: string) => string;
export declare const verifyAccessToken: (token: string) => JwtPayload;
export declare const generateRefreshToken: (payload: JwtPayload) => string;
export declare const verifyRefreshToken: (token: string) => JwtPayload;
export declare const setTokensInCookies: (res: Response, accessToken: string, refreshToken: string) => void;
export declare const clearCookies: (res: Response) => void;
export declare const removeRefreshToken: (userId: string) => Promise<{
    message: string;
}>;
export {};
//# sourceMappingURL=jwt.utils.d.ts.map