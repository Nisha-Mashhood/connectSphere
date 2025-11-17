import mongoose, { Schema } from "mongoose";
import { generateCustomId } from "../core/utils/id-generator";
import { IChatMessage } from "../Interfaces/Models/i-chat-message";
import logger from "../core/utils/logger";

const chatSchema: Schema<IChatMessage> = new mongoose.Schema(
  {
    ChatId: {
      type: String,
      unique: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    thumbnailUrl: {
      type: String,
    },
    collaborationId: {
      type: Schema.Types.ObjectId,
      ref: "Collaboration",
      default: null,
    },
    userConnectionId: {
      type: Schema.Types.ObjectId,
      ref: "UserConnection",
      default: null,
    },
    groupId: {
      type: Schema.Types.ObjectId,
      ref: "Group",
      default: null,
    },
    contentType: {
      type: String,
      enum: ["text", "image", "video", "file"],
      required: true,
      default: "text",
    },
    fileMetadata: {
      type: {
        fileName: { type: String },
        fileSize: { type: Number },
        mimeType: { type: String },
      },
      required: false,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["pending", "sent", "read"],
      default: "pending",
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Pre-save hook to generate ChatId
chatSchema.pre("save", async function (next) {
  if (!this.ChatId) {
    try {
      this.ChatId = await generateCustomId("chatMessage", "CMG");
      logger.debug(
        `Generated ChatId: ${this.ChatId} for senderId ${this.senderId}`
      );
    } catch (error) {
      logger.error(
        `Error generating ChatId: ${this.ChatId} for senderId ${this.senderId} : ${error}`
      );
      return next(error as Error);
    }
  }
  next();
});

export default mongoose.model<IChatMessage>("ChatMessage", chatSchema);
