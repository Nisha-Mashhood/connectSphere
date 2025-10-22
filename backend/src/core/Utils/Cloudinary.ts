import { v2 as cloudinary } from "cloudinary";
import  config  from '../../config/env-config';
import fs from "fs/promises";

cloudinary.config({
  cloud_name: config.cloudinaryCloudName,
  api_key: config.cloudinaryApiKey,
  api_secret: config.cloudinaryApiSecret,
});

export const uploadMedia = async (filePath: string, 
  folder?: string, 
  fileSize: number = 0,
  contentType?: "image" | "video" | "file"
) => {
  const maxSize = 10 * 1024 * 1024;
  try {
    const baseTransformations = fileSize > maxSize
      ? [
          { width: 1024, height: 1024, crop: "limit" }, // Images/videos: max 1024x1024
          { quality: "auto:low" }, // Reduce quality for images/videos
          { fetch_format: "auto" }, // Optimize format
        ]
      : [
          { width: 1024, height: 1024, crop: "limit" }, // Still limit size
          { quality: "auto" }, // Default optimization
          { fetch_format: "auto" },
        ];

        let uploadOptions: any = {
          folder,
          resource_type: "auto",
          transformation: baseTransformations,
        };

        if (contentType === "video") {
          uploadOptions.eager = baseTransformations; 
          uploadOptions.eager_async = true; 
        }

        const result = await cloudinary.uploader.upload(filePath, uploadOptions);

    //For thumbnail
    let thumbnailUrl: string | undefined;
    if (contentType === "video") {
      thumbnailUrl = cloudinary.url(result.public_id, {
        resource_type: "video",
        transformation: [
          { width: 200, height: 200, crop: "fill" },
          { fetch_format: "jpg" },
        ],
      });
    } else if (contentType === "file") {
      thumbnailUrl = cloudinary.url(result.public_id, {
        resource_type: "image",
        transformation: [
          { width: 200, height: 200, crop: "fill" },
          { fetch_format: "jpg" },
          { default_image: "file_thumbnail.jpg" },
        ],
      });
    }

    await fs.unlink(filePath); // Remove the file from local storage
    console.log(`Deleted local file: ${filePath}`);
    return { url: result.secure_url, thumbnailUrl, publicId : result.public_id, version: result.version };
  } catch (error) {
    console.error(`Failed to upload image or delete file: ${filePath}`, error);
    throw error;
  }
};

export const generateCloudinaryUrl = (
  publicId: string,
  folder?: string,
  options: {
    width?: number;
    height?: number;
    crop?: string;
    format?: string;
    resourceType?: "image" | "video" | "auto";
    version?: number;
  } = {}
): string => {
  const { width, height, crop, format, resourceType = "image", version } = options;

  // Construct the full ID (folder + publicId)
  const fullPublicId = folder && !publicId.startsWith(`${folder}/`)
    ? `${folder}/${publicId}`
    : publicId;

  return cloudinary.url(fullPublicId, {
    secure: true,
    version,
    resource_type: resourceType,
    transformation: [
      ...(width && height ? [{ width, height, crop: crop || "fill" }] : []),
      ...(format ? [{ fetch_format: format }] : []),
    ],
  });
};