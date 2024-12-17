import mongoose, { Schema, Document } from "mongoose";

export interface IMentor extends Document {
  userId: string;
  isApproved?: boolean;
  skills: string[];
  certifications: string[];
  specialization: string;
  availableSlots: object[];
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
        type: Boolean, 
        default: false 
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
        required: true 
    },
    availableSlots: [
        { 
            type: Object 
        }
    ],
  },
  { timestamps: true }
);

export default mongoose.model<IMentor>("Mentor", MentorSchema);
