import mongoose, { Schema } from "mongoose";
import { IMentorExperience } from "../Interfaces/Models/i-mentor-experience";
import logger from "../core/utils/logger";
import { generateCustomId } from "../core/utils/id-generator";

const MentorExperienceSchema = new Schema(
  {
    mentorExperienceId: {
       type: String,
       unique: true,
    },
    mentorId: {
      type: Schema.Types.ObjectId,
      ref: "Mentor",
      required: true,
      index: true,
    },
    role: {
      type: String,
      required: true,
      trim: true,
    },
    organization: {
      type: String,
      required: true,
      trim: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
    },
    isCurrent: {
      type: Boolean,
      default: false,
    },
    description: {
      type: String,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to generate mentorExperineceId
MentorExperienceSchema.pre("save", async function (next) {
  if (!this.mentorExperienceId) {
    try {
      this.mentorExperienceId = await generateCustomId("mentorExperience", "MTREXP");
      logger.debug(
        `Generated mentorexperineceId: ${this.mentorExperienceId} for mentorId ${this.mentorId}`
      );
    } catch (error) {
      logger.error(
        `Error generating mentorexperineceId: ${this.mentorExperienceId} for mentorId ${this.mentorId} : ${error}`
      );
      return next(error as Error);
    }
  }
  next();
});

export default mongoose.model<IMentorExperience>("MentorExperience", MentorExperienceSchema);
