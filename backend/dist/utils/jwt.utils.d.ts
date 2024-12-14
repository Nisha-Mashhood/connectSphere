interface JwtPayload {
    [key: string]: any;
}
export declare const generateAccessToken: (payload: JwtPayload, expiresIn?: string) => string;
export declare const verifyAccessToken: (token: string) => JwtPayload;
export declare const generateRefreshToken: (payload: JwtPayload) => string;
export declare const verifyRefreshToken: (token: string) => JwtPayload;
export declare const removeRefreshToken: (userId: string) => Promise<{
    message: string;
}>;
export {};
//# sourceMappingURL=jwt.utils.d.ts.map