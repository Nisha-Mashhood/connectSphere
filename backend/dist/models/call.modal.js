import { Schema, model } from "mongoose";
import { generateCustomId } from "../core/Utils/IdGenerator.js";
import logger from "../core/Utils/Logger.js";
export const CallSchema = new Schema({
    CallId: {
        type: String,
        unique: true,
    },
    chatKey: {
        type: String,
        required: true,
        index: true,
    },
    callerId: {
        type: String,
        required: true,
    },
    recipientId: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ["audio", "video"],
        required: true,
    },
    status: {
        type: String,
        enum: ["incoming", "answered", "missed"],
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
});
CallSchema.index({ chatKey: 1, timestamp: -1 });
// Pre-save hook to generate CallId
CallSchema.pre("save", async function (next) {
    if (!this.CallId) {
        try {
            this.CallId = await generateCustomId("call", "CAL");
            logger.debug(`Generated CallId: ${this.CallId} for callerId ${this.callerId}`);
        }
        catch (error) {
            logger.error(`Error generating CallId: ${this.CallId} for callerId ${this.callerId} : ${error}`);
            return next(error);
        }
    }
    next();
});
export const CallModel = model("Call", CallSchema);
//# sourceMappingURL=call.modal.js.map