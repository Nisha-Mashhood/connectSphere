import mongoose, { Schema } from "mongoose";
const MentorSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    isApproved: {
        type: Boolean,
        default: false
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
        required: true
    },
    availableSlots: [
        {
            type: Object
        }
    ],
}, { timestamps: true });
export default mongoose.model("Mentor", MentorSchema);
//# sourceMappingURL=mentor.model.js.map