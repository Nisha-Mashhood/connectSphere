import mongoose, { Schema, Document } from "mongoose";
import { generateCustomId } from "../utils/idGenerator.utils.js";

export interface IContact extends Document {
  _id: mongoose.Types.ObjectId; 
  contactId: string; 
  userId: mongoose.Types.ObjectId; 
  targetUserId?: mongoose.Types.ObjectId; 
  collaborationId?: mongoose.Types.ObjectId; 
  userConnectionId?: mongoose.Types.ObjectId; 
  groupId?: mongoose.Types.ObjectId; 
  type: "user-mentor" | "user-user" | "group"; 
  createdAt: Date;
  updatedAt: Date;
}

const contactSchema: Schema<IContact> = new mongoose.Schema(
  {
    contactId: { 
        type: String, 
        unique: true, 
        required: true 
    }, 
    userId: { 
        type: Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
    },
    targetUserId: { 
        type: Schema.Types.ObjectId, 
        ref: "User" 
    }, // Optional: mentor or user
    collaborationId: { 
        type: Schema.Types.ObjectId, 
        ref: "Collaboration" 
    },
    userConnectionId: { 
        type: Schema.Types.ObjectId, 
        ref: "UserConnection" 
    },
    groupId: { 
        type: Schema.Types.ObjectId, 
        ref: "Group" 
    },
    type: {
      type: String,
      enum: ["user-mentor", "user-user", "group"],
      required: true,
    },
  },
  { timestamps: true }
);

// Pre-save hook to generate contactId
contactSchema.pre("save", async function (next) {
  if (!this.contactId) {
    this.contactId = await generateCustomId("contact", "CNT");
  }
  next();
});

export default mongoose.model<IContact>("Contact", contactSchema);
