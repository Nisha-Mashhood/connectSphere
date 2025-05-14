import mongoose, { Schema, Document } from "mongoose";
import { generateCustomId } from "../utils/idGenerator.utils.js";

export interface IChatMessage extends Document {
  ChatId: string;
  senderId: mongoose.Types.ObjectId;
  content: string;
  thumbnailUrl?: string;
  collaborationId?: mongoose.Types.ObjectId; // For user-mentor chats
  userConnectionId?: mongoose.Types.ObjectId; // For user-user chats
  groupId?: mongoose.Types.ObjectId; // For group chats
  contentType: "text" | "image" | "video" | "file";
  fileMetadata?: {
    fileName: string;
    fileSize: number;
    mimeType: string;
  };
  isRead: boolean;
  status: "pending" | "sent" | "read" ;
  timestamp: Date;
}

const chatSchema: Schema<IChatMessage> = new mongoose.Schema(
  {
    ChatId:{
      type: String,
      required: true,
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
      type: String 
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
    status:{
      type: String,
      enum: [ "pending" , "sent" , "read" ],
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
    this.ChatId = await generateCustomId("chatMessage", "CMG");
  }
  next();
});

export default mongoose.model<IChatMessage>("ChatMessage", chatSchema);
