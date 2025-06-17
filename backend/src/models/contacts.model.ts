import mongoose, { Schema } from "mongoose";
import { generateCustomId } from "../utils/idGenerator.utils.js";
import { IContact } from "../Interfaces/models/IContact.js";

const contactSchema: Schema<IContact> = new mongoose.Schema(
  {
    contactId: {
      type: String,
      unique: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    targetUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    }, // Optional: mentor or user
    collaborationId: {
      type: Schema.Types.ObjectId,
      ref: "Collaboration",
    },
    userConnectionId: {
      type: Schema.Types.ObjectId,
      ref: "UserConnection",
    },
    groupId: {
      type: Schema.Types.ObjectId,
      ref: "Group",
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

// Ensure contactId is set for bulk operations like insertMany
contactSchema.pre("insertMany", async function (next, docs) {
  for (const doc of docs) {
    if (!doc.contactId) {
      doc.contactId = await generateCustomId("contact", "CNT");
    }
  }
  next();
});

export default mongoose.model<IContact>("Contact", contactSchema);
