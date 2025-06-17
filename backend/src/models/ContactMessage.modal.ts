import mongoose, { Schema } from "mongoose";
import { generateCustomId } from "../utils/idGenerator.utils.js";
import { IContactMessage } from "../Interfaces/models/IContactMessage.js";
import logger from "../core/Utils/Logger.js";

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
    try {
      this.contactMessageId = await generateCustomId("contactMessage", "CNM");
      logger.debug(
        `Generated contactMessageId: ${this.contactMessageId} for name ${this.name}`
      );
    } catch (error) {
      logger.error(
        `Error generating contactMessageId: ${this.contactMessageId} for name ${this.name} : ${error}`
      );
      return next(error as Error);
    }
  }
  next();
});

export default mongoose.model<IContactMessage>(
  "ContactMessage",
  ContactMessageSchema
);
