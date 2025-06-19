import { Response } from 'express';
interface JwtPayload {
    [key: string]: any;
}
export declare class AuthService {
    private userRepo;
    constructor();
    generateAccessToken(payload: JwtPayload, expiresIn?: string): string;
    verifyAccessToken(token: string): JwtPayload;
    generateRefreshToken(payload: JwtPayload): string;
    verifyRefreshToken(token: string): JwtPayload;
    setTokensInCookies(res: Response, accessToken: string, refreshToken: string): void;
    clearCookies(res: Response): void;
    removeRefreshToken(userEmail: string): Promise<{
        message: string;
    }>;
}
export {};
//# sourceMappingURL=JWT.d.ts.map