import React from "react";
import { Button } from "@nextui-org/react";
import { Image as ImageIcon, FileText, Video, X } from "lucide-react";
import { FilePreviewProps } from "./types";

const allowedTypes = {
  image: ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"],
  video: ["video/mp4", "video/webm", "video/quicktime"],
};

const FilePreview: React.FC<FilePreviewProps> = ({ file, previewUrl, onRemove }) => {
  if (!file || !previewUrl) return null;

  const isImage = allowedTypes.image.includes(file.type);
  const isVideo = allowedTypes.video.includes(file.type);

  const fileIcon = isImage ? <ImageIcon size={16} /> : isVideo ? <Video size={16} /> : <FileText size={16} />;
  const fileName = file.name.length > 20 ? file.name.substring(0, 20) + "..." : file.name;

  return (
    <div className="p-2 sm:p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-purple-100 dark:border-gray-700 mt-2 animate-fade-in">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
          {fileIcon}
          <span className="truncate max-w-[200px] sm:max-w-xs">{fileName}</span>
        </div>
        <Button
          isIconOnly
          size="sm"
          variant="light"
          color="danger"
          className="min-w-0 w-5 h-5 sm:w-6 sm:h-6"
          onPress={onRemove}
        >
          <X size={14} />
        </Button>
      </div>
      <div className="flex items-center justify-center bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden mb-2">
        {isImage && <img src={previewUrl} alt="Preview" className="max-h-32 sm:max-h-40 object-contain w-full" />}
        {isVideo && <video src={previewUrl} controls className="max-h-32 sm:max-h-40 max-w-full" />}
        {!isImage && !isVideo && (
          <div className="py-4 px-4 flex flex-col items-center">
            <FileText size={24} className="text-gray-500 dark:text-gray-400 mb-2" />
            <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{file.name}</span>
            <span className="text-xs text-gray-400 dark:text-gray-500">{(file.size / 1024).toFixed(1)} KB</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default FilePreview;