import { generateCloudinaryUrl } from '../../../core/Utils/cloudinary';

export function resolveImage(value: string | null | undefined , folder: string): string | undefined {
  if (!value) return undefined;
  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }
  return generateCloudinaryUrl(value, folder, { width: 200, height: 200 });
}