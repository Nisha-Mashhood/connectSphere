import React, { useRef, useState } from "react";
import { Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Progress } from "@nextui-org/react";
import { FaPaperclip } from "react-icons/fa";
import { Contact, IChatMessage } from "../../../../types";
import { uploadMedia } from "../../../../Service/Chat.Service";

interface ChatInputProps {
  selectedContact: Contact | null;
  currentUserId?: string;
  onSendMessage: (message: IChatMessage & { targetId: string; type: string }) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ selectedContact, currentUserId, onSendMessage }) => {
  const [messageInput, setMessageInput] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Allowed file types categorized
  const allowedTypes = {
    image: ["image/jpeg", "image/jpg", "image/png"],
    video: ["video/mp4"],
    file: ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
  };

  // Handle sending a text message
  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedContact || !currentUserId || isUploading) return;

    // Determine the receiver based on who the sender is
    const isSenderUser = selectedContact.userId === currentUserId;
    const targetId = isSenderUser ? selectedContact.targetId : selectedContact.userId;

    const message: IChatMessage & { targetId: string; type: string } = {
      _id: "",
      senderId: currentUserId,
      content: messageInput,
      contentType: "text",
      timestamp: new Date().toISOString(),
      targetId,
      type: selectedContact.type,
      ...(selectedContact.type === "group" && { groupId: selectedContact.groupId }),
      ...(selectedContact.type === "user-mentor" && { collaborationId: selectedContact.collaborationId }),
      ...(selectedContact.type === "user-user" && { userConnectionId: selectedContact.userConnectionId }),
    };

    onSendMessage(message);
    setMessageInput("");
    inputRef.current?.focus();
  };

  // Trigger file input based on selected type
  const handleFileTypeSelect = (type: "image" | "video" | "file") => {
    if (isUploading) return;
    setError(null);
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.accept = allowedTypes[type].join(",");
      fileInputRef.current.click();
    }
  };

  // Handle file input change
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedContact || !currentUserId || isUploading) return;

    const fileType = file.type;
    const isImage = allowedTypes.image.includes(fileType);
    const isVideo = allowedTypes.video.includes(fileType);
    const isFile = allowedTypes.file.includes(fileType);

    if (!isImage && !isVideo && !isFile) {
      setError(`Unsupported file type. Allowed: ${Object.values(allowedTypes).flat().join(", ")}`);
      return;
    }

    setSelectedFile(file);
    setError(null);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url); // For preview display
  };

  // Upload file to server and send as a media message
  const handleUpload = async () => {
    if (!selectedFile || !selectedContact || !currentUserId || isUploading) return;

    setIsUploading(true);
    setUploadProgress(0);

    const fileToUpload = selectedFile;
    setSelectedFile(null);
    setPreviewUrl(null);

    try {
      const { url, thumbnailUrl, messageId } = await uploadMedia(
        fileToUpload,
        currentUserId,
        selectedContact.id,
        selectedContact.type,
        selectedContact.collaborationId,
        selectedContact.userConnectionId,
        selectedContact.groupId,
        (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
          }
        }
      );

      const contentType = allowedTypes.image.includes(fileToUpload.type)
        ? "image"
        : allowedTypes.video.includes(fileToUpload.type)
        ? "video"
        : "file";

      const message: IChatMessage & { targetId: string; type: string } = {
        _id: messageId,
        senderId: currentUserId,
        content: url,
        thumbnailUrl,
        contentType,
        timestamp: new Date().toISOString(),
        targetId: selectedContact.id,
        type: selectedContact.type,
        ...(selectedContact.type === "group" && { groupId: selectedContact.groupId }),
        ...(selectedContact.type === "user-mentor" && { collaborationId: selectedContact.collaborationId }),
        ...(selectedContact.type === "user-user" && { userConnectionId: selectedContact.userConnectionId }),
        ...(contentType !== "image" && {
          fileMetadata: {
            fileName: fileToUpload.name,
            fileSize: fileToUpload.size,
            mimeType: fileToUpload.type,
          },
        }),
      };

      onSendMessage(message);
    } catch (error) {
      console.error("Error uploading file:", error);
      setError("Failed to upload file");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = "";
      inputRef.current?.focus();
    }
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
      <div className="flex items-center space-x-2">
        {/* File type dropdown */}
        <Dropdown>
          <DropdownTrigger>
            <Button
              isIconOnly
              variant="flat"
              disabled={!selectedContact || isUploading}
              className="text-blue-500 hover:bg-blue-100 dark:hover:bg-gray-700"
            >
              <FaPaperclip />
            </Button>
          </DropdownTrigger>
          <DropdownMenu aria-label="File type selection">
            <DropdownItem key="image" onPress={() => handleFileTypeSelect("image")}>
              Image
            </DropdownItem>
            <DropdownItem key="video" onPress={() => handleFileTypeSelect("video")}>
              Video
            </DropdownItem>
            <DropdownItem key="file" onPress={() => handleFileTypeSelect("file")}>
              File
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>

        {/* Hidden input for file selection */}
        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />

        {/* Message input field */}
        <input
          ref={inputRef}
          type="text"
          placeholder="Type a message..."
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
          className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={!selectedContact || isUploading}
        />

        {/* Send button */}
        <Button
          color="primary"
          onPress={handleSendMessage}
          disabled={!selectedContact || isUploading}
          className="px-6 py-2 rounded-lg shadow-md hover:scale-105 transition-transform"
        >
          Send
        </Button>
      </div>

      {/* Error message display */}
      {error && <p className="text-red-500 mt-2">{error}</p>}

      {/* Upload progress bar */}
      {isUploading && (
        <Progress
          value={uploadProgress}
          maxValue={100}
          label="Uploading..."
          showValueLabel={true}
          className="mt-2"
          color="success"
        />
      )}

      {/* File/media preview before sending */}
      {previewUrl && selectedFile && (
        <div className="mt-2 flex items-center space-x-2">
          {allowedTypes.image.includes(selectedFile.type) && (
            <img src={previewUrl} alt="Preview" className="max-w-[100px] max-h-[100px] rounded-lg" />
          )}
          {allowedTypes.video.includes(selectedFile.type) && (
            <video src={previewUrl} controls className="max-w-[100px] max-h-[100px] rounded-lg" />
          )}
          {!allowedTypes.image.includes(selectedFile.type) &&
            !allowedTypes.video.includes(selectedFile.type) && (
              <p className="text-gray-700 dark:text-gray-300">{selectedFile.name}</p>
            )}
          <Button size="sm" color="primary" onPress={handleUpload} className="shadow-md">
            Send
          </Button>
          <Button
            size="sm"
            color="danger"
            onPress={() => {
              setSelectedFile(null);
              setPreviewUrl(null);
            }}
            className="shadow-md"
          >
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
};

export default ChatInput;
