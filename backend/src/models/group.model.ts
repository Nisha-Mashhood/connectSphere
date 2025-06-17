import mongoose, { Schema } from "mongoose";
import { generateCustomId } from "../utils/idGenerator.utils.js";
import { GroupDocument } from "../Interfaces/models/GroupDocument.js";
import logger from "../core/Utils/Logger.js";

const GroupSchema: Schema = new Schema<GroupDocument>(
  {
    groupId: {
      type: String,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    bio: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      default: 0,
    },
    maxMembers: {
      type: Number,
      required: true,
    },
    isFull: {
      type: Boolean,
      default: false,
    },
    availableSlots: [
      {
        day: {
          type: String,
          required: true,
        },
        timeSlots: [
          {
            type: String,
            required: true,
          },
        ],
      },
    ],
    profilePic: {
      type: String,
      default: "", // Optional
    },
    coverPic: {
      type: String,
      default: "", // Optional
    },
    startDate: {
      type: Date,
      required: true,
    },
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Pre-save hook to generate groupId
GroupSchema.pre("save", async function (next) {
  if (!this.groupId) {
    try {
      this.groupId = await generateCustomId("group", "GRP");
      logger.debug(`Generated groupId: ${this.groupId} for name ${this.name}`);
    } catch (error) {
      logger.error(
        `Error generating groupId: ${this.groupId} for name ${this.name} : ${error}`
      );
      return next(error as Error);
    }
  }
  next();
});

const Group = mongoose.model<GroupDocument>("Group", GroupSchema);

export default Group;
