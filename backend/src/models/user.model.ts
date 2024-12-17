import mongoose, { Schema, Document, Model } from "mongoose";
import config from '../config/env.config.js'

export interface UserInterface extends Document {
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: Date;
  username?: string;
  password?: string;
  jobTitle?: string;
  industry?: string;
  reasonForJoining?: string;
  role?: "user" | "mentor";
  isBlocked: boolean;
  provider?: string;
  providerId?: string;
  profilePic?: string;
  coverPic?: string;
  accessToken?: string;
  refreshToken?:string | null;
  createdAt: Date;
  updatedAt: Date;
  _id: mongoose.Types.ObjectId;
}

const userSchema: Schema<UserInterface> = new mongoose.Schema(
  {
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
        default:null, 
        unique: true 
    },
    password: { 
        type: String,
        default:null, 
    },
    jobTitle: { 
        type: String,
        default:null
    },
    industry: { 
        type: String,
        default:null
    },
    reasonForJoining: { 
        type: String,
        default:null 
    },
    role: { 
        type: String, 
        enum: ["user", "mentor"], 
        default:null 
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
  },
  { timestamps: true }
);

const User: Model<UserInterface> = mongoose.model<UserInterface>("User",userSchema);

export default User;
