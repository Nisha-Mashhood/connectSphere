import mongoose, { Schema } from 'mongoose';
import { generateCustomId } from '../utils/idGenerator.utils.js';
const GroupRequestSchema = new Schema({
    groupRequestId: {
        type: String,
        unique: true,
    },
    groupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Accepted', 'Rejected'],
        default: 'Pending'
    },
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Completed', 'Failed'],
        default: 'Pending'
    },
    paymentId: {
        type: String,
        default: null // Optional: can be filled after successful payment
    },
    amountPaid: {
        type: Number,
        default: 0 // Default 0 for groups without payment
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
}, { timestamps: true });
// Pre-save hook to generate groupRequestId
GroupRequestSchema.pre("save", async function (next) {
    if (!this.groupRequestId) {
        this.groupRequestId = await generateCustomId("groupRequest", "GRQ");
    }
    next();
});
const GroupRequest = mongoose.model('GroupRequest', GroupRequestSchema);
export default GroupRequest;
//# sourceMappingURL=groupRequest.model.js.map