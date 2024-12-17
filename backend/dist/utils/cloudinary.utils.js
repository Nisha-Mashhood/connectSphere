import { v2 as cloudinary } from "cloudinary";
import config from '../config/env.config.js';
cloudinary.config({
    cloud_name: config.cloudinaryCloudName,
    api_key: config.cloudinaryApiKey,
    api_secret: config.cloudinaryApiSecret,
});
export const uploadImage = async (filePath, folder) => {
    try {
        const result = await cloudinary.uploader.upload(filePath, {
            folder,
            transformation: [
                { width: 500, height: 500, crop: "limit" },
                { quality: "auto", fetch_format: "auto" },
            ],
        });
        return result.secure_url;
    }
    catch (error) {
        throw new Error("Image upload failed");
    }
};
//# sourceMappingURL=cloudinary.utils.js.map