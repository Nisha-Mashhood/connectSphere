import logger from '../../../core/utils/logger';
import { generateCloudinaryUrl } from '../../../core/utils/cloudinary';

export function resolveImage(value: string | null | undefined , folder: string): string | undefined {
  if (!value) return undefined;
  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }
  const url = generateCloudinaryUrl(value, folder, { width: 200, height: 200 });
  logger.info("The cloudinary url for the image is : ",url);
  return url;
}