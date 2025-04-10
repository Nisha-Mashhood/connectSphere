import React, { useRef, useState } from "react";
<<<<<<< HEAD
import { Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Progress } from "@nextui-org/react";
=======
import { Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@nextui-org/react";
>>>>>>> 6dc4153e54462faf8ee2145cbaee39113d0c24cd
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
<<<<<<< HEAD
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Allowed file types categorized
=======
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastUploadTime = useRef<number>(0);

>>>>>>> 6dc4153e54462faf8ee2145cbaee39113d0c24cd
  const allowedTypes = {
    image: ["image/jpeg", "image/jpg", "image/png"],
    video: ["video/mp4"],
    file: ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
  };

<<<<<<< HEAD
  // Handle sending a text message
  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedContact || !currentUserId || isUploading) return;

    // Determine the receiver based on who the sender is
    const isSenderUser = selectedContact.userId === currentUserId;
    const targetId = isSenderUser ? selectedContact.targetId : selectedContact.userId;

=======
  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedContact || !currentUserId) return;
  
    const isSenderUser = selectedContact.userId === currentUserId;
    const targetId = isSenderUser ? selectedContact.targetId : selectedContact.userId;
  
>>>>>>> 6dc4153e54462faf8ee2145cbaee39113d0c24cd
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
<<<<<<< HEAD

=======
  
>>>>>>> 6dc4153e54462faf8ee2145cbaee39113d0c24cd
    onSendMessage(message);
    setMessageInput("");
    inputRef.current?.focus();
  };

<<<<<<< HEAD
  // Trigger file input based on selected type
  const handleFileTypeSelect = (type: "image" | "video" | "file") => {
    if (isUploading) return;
=======
  const handleFileTypeSelect = (type: "image" | "video" | "file") => {
>>>>>>> 6dc4153e54462faf8ee2145cbaee39113d0c24cd
    setError(null);
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.accept = allowedTypes[type].join(",");
      fileInputRef.current.click();
    }
  };

<<<<<<< HEAD
  // Handle file input change
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedContact || !currentUserId || isUploading) return;
=======
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedContact || !currentUserId) return;
>>>>>>> 6dc4153e54462faf8ee2145cbaee39113d0c24cd

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
<<<<<<< HEAD
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
=======

    // Generate preview
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleUpload = async () => {
    if (!selectedFile || !selectedContact || !currentUserId) return;

    const now = Date.now();
    if (now - lastUploadTime.current < 1000) return;
    lastUploadTime.current = now;

    if (fileInputRef.current?.disabled) return;
    fileInputRef.current.disabled = true;

    try {
      const { url, messageId } = await uploadMedia(
        selectedFile,
>>>>>>> 6dc4153e54462faf8ee2145cbaee39113d0c24cd
        currentUserId,
        selectedContact.id,
        selectedContact.type,
        selectedContact.collaborationId,
        selectedContact.userConnectionId,
<<<<<<< HEAD
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

=======
        selectedContact.groupId
      );
      const contentType = allowedTypes.image.includes(selectedFile.type)
        ? "image"
        : allowedTypes.video.includes(selectedFile.type)
        ? "video"
        : "file";
>>>>>>> 6dc4153e54462faf8ee2145cbaee39113d0c24cd
      const message: IChatMessage & { targetId: string; type: string } = {
        _id: messageId,
        senderId: currentUserId,
        content: url,
<<<<<<< HEAD
        thumbnailUrl,
=======
>>>>>>> 6dc4153e54462faf8ee2145cbaee39113d0c24cd
        contentType,
        timestamp: new Date().toISOString(),
        targetId: selectedContact.id,
        type: selectedContact.type,
        ...(selectedContact.type === "group" && { groupId: selectedContact.groupId }),
        ...(selectedContact.type === "user-mentor" && { collaborationId: selectedContact.collaborationId }),
        ...(selectedContact.type === "user-user" && { userConnectionId: selectedContact.userConnectionId }),
<<<<<<< HEAD
        ...(contentType !== "image" && {
          fileMetadata: {
            fileName: fileToUpload.name,
            fileSize: fileToUpload.size,
            mimeType: fileToUpload.type,
          },
        }),
      };

      onSendMessage(message);
=======
        ...(contentType === "file" && {
          fileMetadata: {
            fileName: selectedFile.name,
            fileSize: selectedFile.size,
            mimeType: selectedFile.type,
          },
        }),
      };
      onSendMessage(message);
      setSelectedFile(null);
      setPreviewUrl(null);
>>>>>>> 6dc4153e54462faf8ee2145cbaee39113d0c24cd
    } catch (error) {
      console.error("Error uploading file:", error);
      setError("Failed to upload file");
    } finally {
<<<<<<< HEAD
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = "";
=======
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
        fileInputRef.current.disabled = false;
      }
>>>>>>> 6dc4153e54462faf8ee2145cbaee39113d0c24cd
      inputRef.current?.focus();
    }
  };

<<<<<<< HEAD
  return (
    <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
      <div className="flex items-center space-x-2">
        {/* File type dropdown */}
=======
  const renderPreview = () => {
    if (!previewUrl || !selectedFile) return null;
    const isImage = allowedTypes.image.includes(selectedFile.type);
    const isVideo = allowedTypes.video.includes(selectedFile.type);

    return (
      <div className="mt-2">
        {isImage && <img src={previewUrl} alt="Preview" className="max-w-[100px] max-h-[100px]" />}
        {isVideo && <video src={previewUrl} controls className="max-w-[100px] max-h-[100px]" />}
        {!isImage && !isVideo && <p>{selectedFile.name}</p>}
        <Button size="sm" color="primary" onPress={handleUpload} className="mt-1">
          Send
        </Button>
        <Button size="sm" color="danger" onPress={() => { setSelectedFile(null); setPreviewUrl(null); }} className="mt-1 ml-2">
          Cancel
        </Button>
      </div>
    );
  };

  return (
    <div className="flex flex-col p-2">
      <div className="flex items-center">
>>>>>>> 6dc4153e54462faf8ee2145cbaee39113d0c24cd
        <Dropdown>
          <DropdownTrigger>
            <Button
              isIconOnly
<<<<<<< HEAD
              variant="flat"
              disabled={!selectedContact || isUploading}
              className="text-blue-500 hover:bg-blue-100 dark:hover:bg-gray-700"
=======
              variant="light"
              disabled={!selectedContact}
              className="mr-2"
>>>>>>> 6dc4153e54462faf8ee2145cbaee39113d0c24cd
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
<<<<<<< HEAD

        {/* Hidden input for file selection */}
        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />

        {/* Message input field */}
=======
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />
>>>>>>> 6dc4153e54462faf8ee2145cbaee39113d0c24cd
        <input
          ref={inputRef}
          type="text"
          placeholder="Type a message..."
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
<<<<<<< HEAD
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
=======
          className="flex-1 p-2 border rounded mr-2"
          disabled={!selectedContact}
        />
        <Button color="primary" onPress={handleSendMessage} disabled={!selectedContact}>
          Send
        </Button>
      </div>
      {error && <p className="text-red-500 mt-2">{error}</p>}
      {renderPreview()}
>>>>>>> 6dc4153e54462faf8ee2145cbaee39113d0c24cd
    </div>
  );
};

<<<<<<< HEAD
export default ChatInput;
=======
export default ChatInput;
>>>>>>> 6dc4153e54462faf8ee2145cbaee39113d0c24cd
