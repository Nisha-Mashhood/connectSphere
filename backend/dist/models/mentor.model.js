import mongoose, { Schema } from "mongoose";
const MentorSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    isApproved: {
        type: String,
        enum: ["Processing", "Approved", "Rejected"],
        default: "Processing"
    },
    rejectionReason: {
        type: String,
        default: null
    },
    skills: [
        {
            type: Schema.Types.ObjectId,
            ref: "Skill"
        }
    ],
    certifications: [
        {
            type: String
        }
    ],
    specialization: {
        type: String,
        default: null
    },
    availableSlots: [
        {
            day: { type: String },
            timeSlots: [{ type: String }],
        },
    ],
}, { timestamps: true });
export default mongoose.model("Mentor", MentorSchema);
//# sourceMappingURL=mentor.model.js.map