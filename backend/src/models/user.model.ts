import mongoose, { Schema, Model } from "mongoose";
import config from "../config/env.config.js";
import { generateCustomId } from "../core/Utils/IdGenerator.js";
import { UserInterface } from "../Interfaces/models/IUser.js";
import logger from "../core/Utils/Logger.js";

const userSchema: Schema<UserInterface> = new mongoose.Schema(
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

const User: Model<UserInterface> = mongoose.model<UserInterface>(
  "User",
  userSchema
);

export default User;
