import mongoose, { Schema } from "mongoose";
const MentorRequestSchema = new Schema({
    mentorId: {
        type: Schema.Types.ObjectId,
        ref: "Mentor",
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    selectedSlot: {
        day: { type: String },
        timeSlots: { type: String },
    },
    price: {
        type: Number,
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ["Pending", "Paid", "Failed"],
        default: "Pending"
    },
    isAccepted: {
        type: String,
        enum: ["Pending", "Accepted", "Rejected"],
        default: "Pending"
    },
}, { timestamps: true });
export default mongoose.model("MentorRequest", MentorRequestSchema);
//# sourceMappingURL=mentorRequset.js.map