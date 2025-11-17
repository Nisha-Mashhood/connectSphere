import mongoose, { Schema } from "mongoose";
import { generateCustomId } from "../core/utils/id-generator";
import { IGroup } from "../Interfaces/Models/i-group";
import logger from "../core/utils/logger";

const GroupSchema: Schema = new Schema<IGroup>(
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
      default: "",
    },
    coverPic: {
      type: String,
      default: "",
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

const Group = mongoose.model<IGroup>("Group", GroupSchema);

export default Group;
