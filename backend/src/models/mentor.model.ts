import mongoose, { Schema, Document } from "mongoose";
import { UserInterface } from "./user.model.js";
import { generateCustomId } from '../utils/idGenerator.utils.js';


export interface IMentor extends Document {
  mentorId: string;
  userId: string | UserInterface;
  isApproved?: string;
  rejectionReason?:string;
  skills?: string[];
  certifications?: string[];
  specialization?: string;
  bio:string;
  price:number;
  availableSlots?: object[];
  timePeriod?:number
  createdAt: Date;
  updatedAt: Date;
}

const MentorSchema: Schema = new Schema(
  {
    mentorId:{
      type: String,
      unique: true,
    },
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
      timePeriod: {
        type: Number, 
        required: true,
        default:30
      }
  },
  { timestamps: true }
);

// Pre-save hook to generate mentorId
MentorSchema.pre("save", async function(next) {
    if (!this.mentorId) {
      this.mentorId = await generateCustomId("groupRequest", "MTR");
    }
    next();
  });

export default mongoose.model<IMentor>("Mentor", MentorSchema);
