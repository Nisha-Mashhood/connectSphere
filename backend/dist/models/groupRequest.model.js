import mongoose, { Schema } from 'mongoose';
const GroupRequestSchema = new Schema({
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
const GroupRequest = mongoose.model('GroupRequest', GroupRequestSchema);
export default GroupRequest;
//# sourceMappingURL=groupRequest.model.js.map