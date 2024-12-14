import mongoose, { Schema, Document, Model } from "mongoose";

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
  isMentorApproved?: boolean;
  profilePic?: string;
  coverPic?: string;
  certificate?: string; // For mentors, store certificate file path
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
    isMentorApproved: { 
        type: Boolean, 
        default: false 
    },
    profilePic: { 
        type: String,
        default: "https://www.pngarts.com/files/10/Default-Profile-Picture-PNG-Download-Image.png"
    },
    coverPic: { 
        type: String,
        default: "https://tokystorage.s3.amazonaws.com/images/default-cover.png"
    },
    certificate: { 
        type: String,
        default:null 
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
