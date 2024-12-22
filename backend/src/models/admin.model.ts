import mongoose, { Schema, Document, Model } from "mongoose";
import config from '../config/env.config.js'

export interface AdminInterface extends Document {
  name: string;
  email: string;
  password: string;
  accessToken?: string;
  profilePic?:string;
  refreshToken?:string | null;
  createdAt: Date;
  updatedAt: Date;
  _id: mongoose.Types.ObjectId;
}

const adminSchema: Schema<AdminInterface> = new mongoose.Schema(
  {
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
        required:true
    },profilePic:{
        type:String,
        default:config.defaultprofilepic
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

const Admin: Model<AdminInterface> = mongoose.model<AdminInterface>("Admin",adminSchema);

export default Admin;
