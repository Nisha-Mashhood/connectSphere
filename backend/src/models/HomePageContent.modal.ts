import mongoose, { Schema } from "mongoose";
import { generateCustomId } from "../core/Utils/IdGenerator";
import { IHomePageContent } from "../Interfaces/models/IHomePageContent";
import logger from "../core/Utils/Logger";

const HomePageContentSchema: Schema<IHomePageContent> = new Schema(
  {
    HomePageContentId: {
      type: String,
      unique: true,
    },
    banner: {
      imageUrl: {
        type: String,
        required: true,
      },
      tagline: {
        type: String,
        required: true,
      },
      title: {
        type: String,
        required: true,
      },
      description: {
        type: String,
        required: true,
      },
    },
    features: [
      {
        title: {
          type: String,
          required: true,
        },
        description: [
          {
            type: String,
            required: true,
          },
        ],
        icon: {
          type: String,
          required: true,
        },
      },
    ],
    footer: {
      links: [
        {
          name: {
            type: String,
            required: true,
          },
          url: {
            type: String,
            required: true,
          },
        },
      ],
      socialMedia: [
        {
          name: {
            type: String,
            required: true,
          },
          url: {
            type: String,
            required: true,
          },
          icon: {
            type: String,
            required: true,
          },
        },
      ],
      copyright: {
        type: String,
        required: true,
      },
    },
  },
  { timestamps: true }
);

// Pre-save hook to generate HomePageContentId
HomePageContentSchema.pre("save", async function (next) {
  if (!this.HomePageContentId) {
    try {
      this.HomePageContentId = await generateCustomId("homePageContent", "HPC");
      logger.debug(`Generated HomePageContentId: ${this.HomePageContentId}`);
    } catch (error) {
      logger.error(
        `Error generating HomePageContentId: ${this.HomePageContentId} : ${error}`
      );
      return next(error as Error);
    }
  }
  next();
});

export default mongoose.model<IHomePageContent>(
  "HomePageContent",
  HomePageContentSchema
);
