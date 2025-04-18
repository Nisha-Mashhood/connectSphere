import mongoose, { Schema } from "mongoose";
const chatSchema = new mongoose.Schema({
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
    status: {
        type: String,
        enum: ["pending", "sent", "read"],
        default: "pending",
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });
export default mongoose.model("ChatMessage", chatSchema);
//# sourceMappingURL=chat.model.js.map