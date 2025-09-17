import { Response } from "express";
import { JwtPayload } from "jsonwebtoken";

export interface IJWTService {
  generateAccessToken(payload: JwtPayload, expiresIn?: string): string;
  verifyAccessToken(token: string): JwtPayload;
  generateRefreshToken(payload: JwtPayload): string;
  verifyRefreshToken(token: string): JwtPayload;
  setTokensInCookies(res: Response, accessToken: string, refreshToken: string): void;
  clearCookies(res: Response): void;
  removeRefreshToken(userEmail: string): Promise<{ message: string }>;
}
