import mongoose, { Schema } from "mongoose";
import { generateCustomId } from "../core/Utils/IdGenerator.js";
import logger from "../core/Utils/Logger.js";
const UserConnectionSchema = new Schema({
    connectionId: {
        type: String,
        unique: true,
    },
    requester: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    recipient: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    requestStatus: {
        type: String,
        enum: ["Pending", "Accepted", "Rejected"],
        default: "Pending",
    },
    connectionStatus: {
        type: String,
        enum: ["Connected", "Disconnected"],
        default: "Disconnected",
    },
    requestSentAt: {
        type: Date,
        default: Date.now,
    },
    requestAcceptedAt: {
        type: Date,
    },
    disconnectedAt: {
        type: Date,
    },
    disconnectionReason: {
        type: String,
        default: null,
    },
}, { timestamps: true });
// Pre-save hook to generate connectionId
UserConnectionSchema.pre("save", async function (next) {
    if (!this.connectionId) {
        try {
            this.connectionId = await generateCustomId("userConnection", "UCN");
            logger.debug(`Generated connectionId: ${this.connectionId} for requester ${this.requester} and recipient: ${this.recipient}`);
        }
        catch (error) {
            logger.error(`Error generating connectionId for requester: ${this.requester} and recipient: ${this.recipient}: ${error}`);
            return next(error);
        }
    }
    next();
});
export default mongoose.model("UserConnection", UserConnectionSchema);
//# sourceMappingURL=userConnection.modal.js.map