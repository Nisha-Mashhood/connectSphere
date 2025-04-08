import React, { useRef, useState } from "react";
import { Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@nextui-org/react";
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
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastUploadTime = useRef<number>(0);

  const allowedTypes = {
    image: ["image/jpeg", "image/jpg", "image/png"],
    video: ["video/mp4"],
    file: ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
  };

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedContact || !currentUserId) return;
  
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

  const handleFileTypeSelect = (type: "image" | "video" | "file") => {
    setError(null);
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.accept = allowedTypes[type].join(",");
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedContact || !currentUserId) return;

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
        currentUserId,
        selectedContact.id,
        selectedContact.type,
        selectedContact.collaborationId,
        selectedContact.userConnectionId,
        selectedContact.groupId
      );
      const contentType = allowedTypes.image.includes(selectedFile.type)
        ? "image"
        : allowedTypes.video.includes(selectedFile.type)
        ? "video"
        : "file";
      const message: IChatMessage & { targetId: string; type: string } = {
        _id: messageId,
        senderId: currentUserId,
        content: url,
        contentType,
        timestamp: new Date().toISOString(),
        targetId: selectedContact.id,
        type: selectedContact.type,
        ...(selectedContact.type === "group" && { groupId: selectedContact.groupId }),
        ...(selectedContact.type === "user-mentor" && { collaborationId: selectedContact.collaborationId }),
        ...(selectedContact.type === "user-user" && { userConnectionId: selectedContact.userConnectionId }),
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
    } catch (error) {
      console.error("Error uploading file:", error);
      setError("Failed to upload file");
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
        fileInputRef.current.disabled = false;
      }
      inputRef.current?.focus();
    }
  };

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
        <Dropdown>
          <DropdownTrigger>
            <Button
              isIconOnly
              variant="light"
              disabled={!selectedContact}
              className="mr-2"
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
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />
        <input
          ref={inputRef}
          type="text"
          placeholder="Type a message..."
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
          className="flex-1 p-2 border rounded mr-2"
          disabled={!selectedContact}
        />
        <Button color="primary" onPress={handleSendMessage} disabled={!selectedContact}>
          Send
        </Button>
      </div>
      {error && <p className="text-red-500 mt-2">{error}</p>}
      {renderPreview()}
    </div>
  );
};

export default ChatInput;