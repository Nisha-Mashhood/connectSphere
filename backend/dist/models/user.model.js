import mongoose from "mongoose";
import config from '../config/env.config.js';
const userSchema = new mongoose.Schema({
    fullName: {
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
        required: true
    },
    dateOfBirth: {
        type: Date,
        required: true
    },
    username: {
        type: String,
        default: null,
        unique: true
    },
    password: {
        type: String,
        default: null,
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
        enum: ["user", "mentor"],
        default: null
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
}, { timestamps: true });
const User = mongoose.model("User", userSchema);
export default User;
//# sourceMappingURL=user.model.js.map