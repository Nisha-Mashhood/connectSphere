import mongoose, { Schema, Document } from "mongoose";
import { generateCustomId } from "../utils/idGenerator.utils.js";

interface IFeature {
  title: string;
  description: string[];
  icon: string; // URL to icon or SVG path
}

interface IFooterLink {
  name: string;
  url: string;
}

interface ISocialMedia {
  name: string;
  url: string;
  icon: string; // URL to icon or SVG path
}

interface IHomePageContent extends Document {
  HomePageContentId: string;
  banner: {
    imageUrl: string;
    tagline: string;
    title: string;
    description: string;
  };
  features: IFeature[];
  footer: {
    links: IFooterLink[];
    socialMedia: ISocialMedia[];
    copyright: string;
  };
}

const HomePageContentSchema: Schema = new Schema(
  {
    HomePageContentId: { 
        type: String, 
        required: true 
    },
    banner: {
      imageUrl: { 
        type: String, 
        required: true 
    },
      tagline: { 
        type: String, 
        required: true 
    },
      title: { 
        type: String, 
        required: true 
    },
      description: { 
        type: String, 
        required: true 
    },
    },
    features: [
      {
        title: { 
            type: String, 
            required: true 
        },
        description: [
            { 
                type: String, 
                required: true 
            }
        ],
        icon: { 
            type: String, 
            required: true 
        },
      },
    ],
    footer: {
      links: [
        {
          name: { 
            type: String, 
            required: true 
        },
          url: { 
            type: String, 
            required: true 
        },
        },
      ],
      socialMedia: [
        {
          name: { 
            type: String, 
            required: true 
        },
          url: { 
            type: String, 
            required: true 
        },
          icon: { 
            type: String, 
            required: true 
        },
        },
      ],
      copyright: { 
        type: String,
        required: true 
        },
    },
  },
  { timestamps: true }
);

// Pre-save hook to generate HomePageContentId
HomePageContentSchema.pre("save", async function (next) {
  if (!this.HomePageContentId) {
    this.HomePageContentId = await generateCustomId("homePageContent", "HPC");
  }
  next();
});

export default mongoose.model<IHomePageContent>(
  "HomePageContent",
  HomePageContentSchema
);
