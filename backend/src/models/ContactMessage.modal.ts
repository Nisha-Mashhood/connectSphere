import mongoose, { Schema } from "mongoose";
import { generateCustomId } from "../utils/idGenerator.utils.js";
import { IContactMessage } from "../Interfaces/models/IContactMessage.js";

const ContactMessageSchema: Schema<IContactMessage> = new Schema(
  {
    contactMessageId: {
      type: String,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    givenReply: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

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
