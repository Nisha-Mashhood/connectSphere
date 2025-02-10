import mongoose, { Schema } from 'mongoose';
const GroupSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    bio: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        default: 0
    },
    maxMembers: {
        type: Number,
        required: true
    },
    availableSlots: [
        {
            day: {
                type: String,
                required: true
            },
            timeSlots: [
                {
                    type: String,
                    required: true
                }
            ],
        },
    ],
    profilePic: {
        type: String,
        default: '' // Optional
    },
    coverPic: {
        type: String,
        default: '' // Optional
    },
    startDate: {
        type: Date,
        required: true
    },
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    members: [
        {
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            joinedAt: {
                type: Date,
                default: Date.now
            },
        },
    ],
    createdAt: {
        type: Date,
        default: Date.now
    },
}, { timestamps: true });
const Group = mongoose.model('Group', GroupSchema);
export default Group;
//# sourceMappingURL=group.model.js.map