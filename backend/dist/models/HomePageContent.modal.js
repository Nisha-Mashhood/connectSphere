import mongoose, { Schema } from "mongoose";
import { generateCustomId } from "../utils/idGenerator.utils.js";
const HomePageContentSchema = new Schema({
    HomePageContentId: {
        type: String,
        unique: true,
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
}, { timestamps: true });
// Pre-save hook to generate HomePageContentId
HomePageContentSchema.pre("save", async function (next) {
    if (!this.HomePageContentId) {
        this.HomePageContentId = await generateCustomId("homePageContent", "HPC");
    }
    next();
});
export default mongoose.model("HomePageContent", HomePageContentSchema);
//# sourceMappingURL=HomePageContent.modal.js.map