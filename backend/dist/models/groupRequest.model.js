import mongoose, { Schema } from "mongoose";
import { generateCustomId } from "../core/Utils/IdGenerator.js";
import logger from "../core/Utils/Logger.js";
const GroupRequestSchema = new Schema({
    groupRequestId: {
        type: String,
        unique: true,
    },
    groupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Group",
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    status: {
        type: String,
        enum: ["Pending", "Accepted", "Rejected"],
        default: "Pending",
    },
    paymentStatus: {
        type: String,
        enum: ["Pending", "Completed", "Failed"],
        default: "Pending",
    },
    paymentId: {
        type: String,
        default: null, // Optional: can be filled after successful payment
    },
    amountPaid: {
        type: Number,
        default: 0, // Default 0 for groups without payment
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });
// Pre-save hook to generate groupRequestId
GroupRequestSchema.pre("save", async function (next) {
    if (!this.groupRequestId) {
        try {
            this.groupRequestId = await generateCustomId("groupRequest", "GRQ");
            logger.debug(`Generated groupRequestId: ${this.groupRequestId} for groupId ${this.groupId}`);
        }
        catch (error) {
            logger.error(`Error generating groupRequestId: ${this.groupRequestId} for groupId ${this.groupId} : ${error}`);
            return next(error);
        }
    }
    next();
});
const GroupRequest = mongoose.model("GroupRequest", GroupRequestSchema);
export default GroupRequest;
//# sourceMappingURL=groupRequest.model.js.map