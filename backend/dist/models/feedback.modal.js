import mongoose, { Schema } from 'mongoose';
const FeedbackSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    mentorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Mentor",
        required: true,
    },
    collaborationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Collaboration",
        required: true,
    },
    givenBy: {
        type: String,
        enum: ["user", "mentor"],
        required: true,
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },
    communication: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },
    expertise: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },
    punctuality: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },
    comments: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 500,
    },
    wouldRecommend: {
        type: Boolean,
        required: true,
    },
}, { timestamps: true });
export default mongoose.model("Feedback", FeedbackSchema);
//# sourceMappingURL=feedback.modal.js.map