import { Document, Types } from "mongoose";

export interface IUser extends Document {
  userId: string;
  name: string;
  email: string;
  phone?: string;
  dateOfBirth?: Date;
  password: string | null;
  jobTitle?: string;
  industry?: string;
  reasonForJoining?: string;
  role?: "user" | "mentor" | "admin";
  isBlocked: boolean;
  provider?: string;
  providerId?: string | null;
  profilePic?: string | null;
  coverPic?: string | null;
  accessToken?: string;
  refreshToken?: string | null;
  loginCount: number;
  hasReviewed: boolean;
  createdAt: Date;
  updatedAt: Date;
  _id: Types.ObjectId;
}
