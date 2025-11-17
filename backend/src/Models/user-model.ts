import mongoose, { Schema, Model } from "mongoose";
import config from "../config/env-config";
import { generateCustomId } from "../core/utils/id-generator";
import { IUser } from "../Interfaces/Models/i-user";
import logger from "../core/utils/logger";

const userSchema: Schema<IUser> = new mongoose.Schema(
  {
    userId: {
      type: String,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: String,
    },
    dateOfBirth: {
      type: Date,
    },
    password: {
      type: String,
      default: null,
    },
    jobTitle: {
      type: String,
      default: null,
    },
    industry: {
      type: String,
      default: null,
    },
    reasonForJoining: {
      type: String,
      default: null,
    },
    role: {
      type: String,
      enum: ["user", "mentor", "admin"],
      default: "user",
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    provider: {
      type: String,
      enum: ["google", "facebook", "github"],
      default: null,
    },
    providerId: {
      type: String,
      default: null,
    },
    profilePic: {
      type: String,
      default: config.defaultprofilepic,
    },
    coverPic: {
      type: String,
      default: config.defaultcoverpic,
    },
    accessToken: {
      type: String,
      default: null,
      required: false,
    },
    refreshToken: {
      type: String,
      default: null,
      required: false,
    },
    loginCount: {
      type: Number,
      default: 0,
    },
    hasReviewed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Pre-save hook to generate userId
userSchema.pre("save", async function (next) {
  if (!this.userId) {
    try {
      this.userId = await generateCustomId("user", "USR");
      logger.debug(`Generated userId: ${this.userId} for email: ${this.email}`);
    } catch (error) {
      logger.error(
        `Error generating userId for email: ${this.email}: ${error}`
      );
      return next(error as Error);
    }
  }
  next();
});

const User: Model<IUser> = mongoose.model<IUser>(
  "User",
  userSchema
);

export default User;
