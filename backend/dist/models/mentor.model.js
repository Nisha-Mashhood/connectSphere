import mongoose, { Schema } from "mongoose";
import { generateCustomId } from '../utils/idGenerator.utils.js';
const MentorSchema = new Schema({
    mentorId: {
        type: String,
        unique: true,
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    isApproved: {
        type: String,
        enum: ["Processing", "Completed", "Rejected"],
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
    bio: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    availableSlots: [
        {
            day: { type: String },
            timeSlots: [{ type: String }],
        },
    ],
    timePeriod: {
        type: Number,
        required: true,
        default: 30
    }
}, { timestamps: true });
// Pre-save hook to generate mentorId
MentorSchema.pre("save", async function (next) {
    if (!this.mentorId) {
        this.mentorId = await generateCustomId("groupRequest", "MTR");
    }
    next();
});
export default mongoose.model("Mentor", MentorSchema);
//# sourceMappingURL=mentor.model.js.map