import mongoose from "mongoose";
import { Schema, model } from "mongoose";
import { generateCustomId } from "../core/utils/id-generator";
import { IAppNotification } from "../Interfaces/Models/i-app-notification";
import logger from "../core/utils/logger";

const AppNotificationSchema = new Schema<IAppNotification>({
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
    enum: ["message", "incoming_call", "missed_call", "task_reminder", "new_user", 'new_mentor', 'mentor_approved', 'collaboration_status'],
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
  }, 
  callType: { 
    type: String, 
    enum: ["audio", "video"], 
    required: false 
  },
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
      enum: ["user", "group", "collaboration", "userconnection"],
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

export const AppNotificationModel = model<IAppNotification>(
  "AppNotification",
  AppNotificationSchema
);