import mongoose, { Schema, Document } from "mongoose";
import { generateCustomId } from "../utils/idGenerator.utils.js";

interface IContactMessage extends Document {
  contactMessageId: string;
  name: string;
  email: string;
  message: string;
  createdAt: Date;
}

const ContactMessageSchema: Schema = new Schema({
  contactMessageId: { 
    type: String, 
    required: true 
},
  name: { 
    type: String, 
    required: true 
},
  email: { 
    type: String, 
    required: true 
},
  message: { 
    type: String, 
    required: true 
},
  createdAt: { 
    type: Date, 
    default: Date.now 
},
});

// Pre-save hook to generate contact messageId
ContactMessageSchema.pre("save", async function (next) {
  if (!this.contactMessageId) {
    this.contactMessageId = await generateCustomId("contactMessage", "CNM");
  }
  next();
});

export default mongoose.model<IContactMessage>(
  "ContactMessage",
  ContactMessageSchema
);
