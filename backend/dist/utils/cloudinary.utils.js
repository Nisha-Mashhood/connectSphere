import { v2 as cloudinary } from "cloudinary";
import config from '../config/env.config.js';
import fs from "fs/promises";
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
        await fs.unlink(filePath); // Remove the file from local storage
        console.log(`Deleted local file: ${filePath}`);
        return result.secure_url;
    }
    catch (error) {
        console.error(`Failed to upload image or delete file: ${filePath}`, error);
        throw new Error("Image upload failed");
    }
};
//# sourceMappingURL=cloudinary.utils.js.map