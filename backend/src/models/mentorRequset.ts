import mongoose, { Schema, Document } from "mongoose";
import { generateCustomId } from '../utils/idGenerator.utils.js';

export interface IMentorRequest extends Document {
  mentorRequestId: string;
  mentorId: string; 
  userId: string; 
  selectedSlot: object;
  price: number;
  timePeriod:number;
  paymentStatus: "Pending" | "Paid" | "Failed";
  isAccepted: String;
  createdAt: Date;
  updatedAt: Date;
}

const MentorRequestSchema: Schema = new Schema(
  {
    mentorRequestId:{
      type: String,
      unique: true,
    },
    mentorId: { 
      type: Schema.Types.ObjectId, 
      ref: "Mentor", 
      required: true 
    },
    userId: { 
      type: Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    selectedSlot:{
          day: { type: String },
          timeSlots: { type: String },
        },
    price: { 
      type: Number, 
      required: true 
    },
    timePeriod: {
      type: Number,
      required:true,
      default:30
    },
    paymentStatus: { 
      type: String, 
      enum: ["Pending", "Paid", "Failed"], 
      default: "Pending" 
    },
    isAccepted: { 
      type: String, 
      enum:["Pending","Accepted", "Rejected"] ,
      default:"Pending"
    },
  },
  { timestamps: true }
);

// Pre-save hook to generate mentorRequestId
MentorRequestSchema.pre("save", async function(next) {
    if (!this.mentorRequestId) {
      this.mentorRequestId = await generateCustomId("mentorRequest", "MRQ");
    }
    next();
  });


export default mongoose.model<IMentorRequest>("MentorRequest", MentorRequestSchema);
