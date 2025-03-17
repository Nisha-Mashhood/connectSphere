import mongoose, { Schema } from "mongoose";
const UserConnectionSchema = new Schema({
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
export default mongoose.model("UserConnection", UserConnectionSchema);
//# sourceMappingURL=userConnection.modal.js.map