import mongoose, { Schema } from "mongoose";
import { generateCustomId } from "../core/Utils/IdGenerator.js";
import logger from "../core/Utils/Logger.js";
const messageSchema = new mongoose.Schema({
    messageId: {
        type: String,
        unique: true,
    },
    senderId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    contactId: {
        type: Schema.Types.ObjectId,
        ref: "Contact",
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    contentType: {
        type: String,
        enum: ["text", "image", "file"],
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
}, { timestamps: true });
// Pre-save hook to generate messageId
messageSchema.pre("save", async function (next) {
    if (!this.messageId) {
        try {
            this.messageId = await generateCustomId("message", "MSG");
            logger.debug(`Generated messageId: ${this.messageId} for senderId ${this.senderId}`);
        }
        catch (error) {
            logger.error(`Error generating messageId: ${this.messageId} for senderId ${this.senderId} : ${error}`);
            return next(error);
        }
    }
    next();
});
export default mongoose.model("Message", messageSchema);
//# sourceMappingURL=messages.model.js.map