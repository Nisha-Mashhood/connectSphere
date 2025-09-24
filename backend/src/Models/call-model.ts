import mongoose, { Schema } from "mongoose";
import { ICallLog } from "../Interfaces/Models/i-call-log";

const CallLogSchema = new Schema<ICallLog>(
  {
    CallId: { 
      type: String, 
      unique: true,
      required: true,
    },
    chatKey: { 
      type: String, 
      required: true 
    },
    callType: { 
      type: String, 
      enum: ["audio", "video"], 
      required: true 
    },
    type: { 
      type: String, 
      enum: ["group", "user-mentor","user-user"], 
      required: true 
    },
    senderId: { 
      type: String, 
      required: true 
    },
    recipientIds: [
      { 
        type: String, 
        required: true 
      }
    ],
    groupId: { 
      type: String 
    },
    status: { 
      type: String, 
      enum: ["ongoing", "completed", "missed"], 
      required: true 
    },
    callerName: { 
      type: String 
    },
    startTime: { 
      type: Date, 
      required: true 
    },
    endTime: { 
      type: Date 
    },
    duration: { 
      type: Number 
    },
    createdAt: { 
      type: Date, 
      default: Date.now 
    },
    updatedAt: { 
      type: Date, 
      default: Date.now 
    },
  },
  { timestamps: true }
);


export default mongoose.model<ICallLog>("Call", CallLogSchema);