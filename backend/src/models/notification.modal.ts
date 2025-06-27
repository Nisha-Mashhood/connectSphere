import mongoose from "mongoose";
import { Schema, model } from "mongoose";
import { generateCustomId } from "../core/Utils/IdGenerator";
import { AppNotification } from "../Interfaces/models/AppNotification";
import logger from "../core/Utils/Logger";

const AppNotificationSchema = new Schema<AppNotification>({
  AppNotificationId: {
    type: String,
    unique: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  type: {
    type: String,
    enum: ["message", "incoming_call", "missed_call", "task_reminder"],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  relatedId: {
    type: String,
    required: true,
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status: {
    type: String,
    enum: ["unread", "read"],
    default: "unread",
  },
  callId: {
    type: String,
    required: false,
  }, // Unique identifier for calls
  notificationDate: {
    type: Date,
    required: false,
  },
  notificationTime: {
    type: String,
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  taskContext: {
    contextType: {
      type: String,
      enum: ["profile", "group", "collaboration", "userconnection"],
      required: false,
    },
    contextId: {
      type: String,
      required: false,
    },
  },
});

AppNotificationSchema.index({ userId: 1, createdAt: -1 });

// Pre-save hook to generate AppNotificationId
AppNotificationSchema.pre("save", async function (next) {
  if (!this.AppNotificationId) {
    try {
      this.AppNotificationId = await generateCustomId("appNotification", "ANF");
      logger.debug(
        `Generated AppNotificationId: ${this.AppNotificationId} for userId ${this.userId}`
      );
    } catch (error) {
      logger.error(
        `Error generating AppNotificationId: ${this.AppNotificationId} for userId ${this.userId} : ${error}`
      );
      return next(error as Error);
    }
  }
  next();
});

export const AppNotificationModel = model<AppNotification>(
  "AppNotification",
  AppNotificationSchema
);
