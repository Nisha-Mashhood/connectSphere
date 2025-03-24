import mongoose, { Schema, Document, Model } from "mongoose";
import config from '../config/env.config.js'
import { generateCustomId } from "../utils/idGenerator.utils.js";

export interface UserInterface extends Document {
  userId: string;
  name: string;
  email: string;
  phone?:string;
  dateOfBirth?: Date;
  password: string | null ;
  jobTitle?: string;
  industry?: string;
  reasonForJoining?: string;
  role?: "user" | "mentor" |"admin";
  isBlocked: boolean;
  provider?: string;
  providerId?: string | null;
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
        default:null
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
        enum: ["user", "mentor","admin"], 
        default:"user" 
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


// Pre-save hook to generate userId
userSchema.pre("save", async function(next) {
    if (!this.userId) {
      this.userId = await generateCustomId("user", "USR");
    }
    next();
  });


const User: Model<UserInterface> = mongoose.model<UserInterface>("User",userSchema);

export default User;
