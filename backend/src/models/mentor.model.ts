import mongoose, { Schema, Document } from "mongoose";

interface IUser {
  name: string;
  email: string;
}

export interface IMentor extends Document {
  userId: string | IUser;
  isApproved?: string;
  rejectionReason?:string;
  skills?: string[];
  certifications?: string[];
  specialization?: string;
  bio:string;
  price:number;
  availableSlots?: object[];
  createdAt: Date;
  updatedAt: Date;
}

const MentorSchema: Schema = new Schema(
  {
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
        default:null 
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
  },
  { timestamps: true }
);

export default mongoose.model<IMentor>("Mentor", MentorSchema);
