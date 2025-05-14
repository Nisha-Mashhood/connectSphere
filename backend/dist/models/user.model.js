import mongoose from "mongoose";
import config from '../config/env.config.js';
import { generateCustomId } from "../utils/idGenerator.utils.js";
const userSchema = new mongoose.Schema({
    userId: {
        type: String,
        unique: true,
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phone: {
        type: String,
    },
    dateOfBirth: {
        type: Date,
    },
    password: {
        type: String,
        default: null
    },
    jobTitle: {
        type: String,
        default: null
    },
    industry: {
        type: String,
        default: null
    },
    reasonForJoining: {
        type: String,
        default: null
    },
    role: {
        type: String,
        enum: ["user", "mentor", "admin"],
        default: "user"
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    provider: {
        type: String,
        enum: ["google", "facebook", "github"],
        default: null
    },
    providerId: {
        type: String,
        default: null
    },
    profilePic: {
        type: String,
        default: config.defaultprofilepic,
    },
    coverPic: {
        type: String,
        default: config.defaultcoverpic,
    },
    accessToken: {
        type: String,
        default: null,
        required: false
    },
    refreshToken: {
        type: String,
        default: null,
        required: false
    },
    loginCount: {
        type: Number,
        default: 0,
    },
    hasReviewed: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });
// Pre-save hook to generate userId
userSchema.pre("save", async function (next) {
    if (!this.userId) {
        this.userId = await generateCustomId("user", "USR");
    }
    next();
});
const User = mongoose.model("User", userSchema);
export default User;
//# sourceMappingURL=user.model.js.map