import React from "react";
import { Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@nextui-org/react";
import { Paperclip, Image as ImageIcon, FileText, Video } from "lucide-react";
import { FileSelectorProps } from "./types";

const allowedTypes = {
  image: ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"],
  video: ["video/mp4", "video/webm", "video/quicktime"],
  file: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
    "application/zip",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ],
};

const FileSelector: React.FC<FileSelectorProps> = ({ disabled, onFileSelect, setError, fileInputRef }) => {
  const handleFileTypeSelect = (type: "image" | "video" | "file") => {
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.accept = allowedTypes[type].join(",");
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <div className="flex-shrink-0">
      <Dropdown placement="top">
        <DropdownTrigger>
          <Button
            isIconOnly
            variant="light"
            radius="full"
            color="secondary"
            disabled={disabled}
            className="min-w-0 w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 dark:bg-gray-800 text-purple-600 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-gray-750"
            aria-label="Attach file"
          >
            <Paperclip size={16} />
          </Button>
        </DropdownTrigger>
        <DropdownMenu variant="flat" aria-label="File type selection">
          <DropdownItem
            key="image"
            startContent={<ImageIcon size={14} />}
            onPress={() => handleFileTypeSelect("image")}
            className="text-xs sm:text-sm"
          >
            Image
          </DropdownItem>
          <DropdownItem
            key="video"
            startContent={<Video size={14} />}
            onPress={() => handleFileTypeSelect("video")}
            className="text-xs sm:text-sm"
          >
            Video
          </DropdownItem>
          <DropdownItem
            key="file"
            startContent={<FileText size={14} />}
            onPress={() => handleFileTypeSelect("file")}
            className="text-xs sm:text-sm"
          >
            Document
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
    </div>
  );
};

export default FileSelector;