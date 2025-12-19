import { v4 as uuidv4 } from "uuid";
import { redisClient } from "../../../config/redis-client-config";
import { OtpPurpose, OtpRedisPayload } from "../../types/auth-types";


 //Generate unique OTP session id
export const generateOtpId = (): string => {
  return uuidv4();
};

//Redis key for OTP
const buildOtpKey = (
  purpose: OtpPurpose,
  email: string,
  otpId: string
): string => {
  return `otp:${purpose}:${email}:${otpId}`;
};

//Save OTP to Redis with TTL
export const saveOtpToRedis = async (
  payload: OtpRedisPayload,
  ttlSeconds: number = 300
): Promise<string> => {
  const otpId = generateOtpId();
  const key = buildOtpKey(payload.purpose, payload.email, otpId);

  await redisClient.set(key, JSON.stringify(payload), "EX", ttlSeconds);

  return otpId;
};

//Get OTP from Redis
export const getOtpFromRedis = async (
  purpose: OtpPurpose,
  email: string,
  otpId: string
): Promise<OtpRedisPayload | null> => {
  const key = buildOtpKey(purpose, email, otpId);
  const value: string | null = await redisClient.get(key);
  if (!value) return null;
  return JSON.parse(value) as OtpRedisPayload;
};

//Delete OTP from Redis
export const deleteOtpFromRedis = async (
  purpose: OtpPurpose,
  email: string,
  otpId: string
): Promise<void> => {
  const key = buildOtpKey(purpose, email, otpId);
  await redisClient.del(key);
};

//Increment OTP attempt count
export const incrementOtpAttempts = async (
  purpose: OtpPurpose,
  email: string,
  otpId: string
): Promise<number> => {
  const key = buildOtpKey(purpose, email, otpId);
  const value: string | null = await redisClient.get(key);
  if (!value) {
    throw new Error("OTP session not found");
  }
  const payload: OtpRedisPayload = JSON.parse(value);
  payload.attempts += 1;
  await redisClient.set(key, JSON.stringify(payload));
  return payload.attempts;
};

//Verify the otp with otpId
export const verifyOtpFromRedis = async (
  purpose: OtpPurpose,
  email: string,
  otpId: string,
  providedOtp: string,
  maxAttempts: number = 5
): Promise<OtpRedisPayload> => {
  const payload = await getOtpFromRedis(purpose, email, otpId);

  if (!payload) {
    throw new Error("OTP expired or not found");
  }
  if (payload.otp !== providedOtp) {
    const attempts = await incrementOtpAttempts(purpose, email, otpId);
    if (attempts >= maxAttempts) {
      await deleteOtpFromRedis(purpose, email, otpId);
      throw new Error("Maximum OTP attempts exceeded");
    }
    throw new Error("Invalid OTP");
  }
  await deleteOtpFromRedis(purpose, email, otpId);
  return payload;
};