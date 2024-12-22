import mongoose from "mongoose";
import config from '../config/env.config.js';
const adminSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }, profilePic: {
        type: String,
        default: config.defaultprofilepic
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
const Admin = mongoose.model("Admin", adminSchema);
export default Admin;
//# sourceMappingURL=admin.model.js.map