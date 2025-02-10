import mongoose, { Schema } from "mongoose";
const CollaborationSchema = new Schema({
    mentorId: {
        type: Schema.Types.ObjectId,
        ref: "Mentor",
        required: true,
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    selectedSlot: [
        {
            day: { type: String },
            timeSlots: [{ type: String }],
        },
    ],
    payment: {
        type: Boolean,
        default: false,
    },
    isCancelled: {
        type: Boolean,
        fefault: false,
    },
    price: {
        type: Number,
        required: true,
    },
    startDate: {
        type: Date,
        required: true,
        default: Date.now,
    },
    endDate: {
        type: Date,
        default: null,
    },
}, { timestamps: true });
export default mongoose.model("Collaboration", CollaborationSchema);
//# sourceMappingURL=collaboration.js.map