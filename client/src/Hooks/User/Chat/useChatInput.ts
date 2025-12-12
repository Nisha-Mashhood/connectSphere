import { useState, useEffect, useRef, useCallback } from "react";
import { uploadMedia } from "../../../Service/Chat.Service";
import { UseChatInputReturn } from "../../../Components/User/Common/Chat/ChatInput/types";
import { Contact } from "../../../Interface/User/Icontact";
import { IChatMessage } from "../../../Interface/User/IchatMessage";
// import { socketService } from "../../../../../Service/SocketService";

interface UseChatInputProps {
  selectedContact: Contact | null;
  currentUserId?: string;
  onSendMessage: (message: IChatMessage & { targetId: string; type: string }) => void;
}

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

export const useChatInput = ({
  selectedContact,
  currentUserId,
  onSendMessage,
}: UseChatInputProps): UseChatInputReturn => {
  const [messageInput, setMessageInput] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const lastUploadTime = useRef<number>(0);

  // Adjust textarea height
  useEffect(() => {
    const textarea = inputRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, [messageInput]);

  const handleUpload = useCallback(async () => {
    if (!selectedFile || !selectedContact || !currentUserId) return;

    const now = Date.now();
    if (now - lastUploadTime.current < 1000) return;
    lastUploadTime.current = now;

    if (isUploading) return;
    setIsUploading(true);

    try {
      const { url, thumbnailUrl, messageId } = await uploadMedia(
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

      const isSenderUser = selectedContact.userId === currentUserId;
      const targetId =
        selectedContact.type === "group"
        ? selectedContact.groupId
        : isSenderUser
        ? selectedContact.targetId
        : selectedContact.userId;

      const message: IChatMessage & { targetId: string; type: string } = {
        _id: messageId || Date.now().toString(),
        senderId: currentUserId,
        content: url,
        thumbnailUrl,
        contentType,
        timestamp: new Date().toISOString(),
        targetId,
        type: selectedContact.type,
        isRead: false,
        status: "pending",
        ...(messageInput.trim() && { caption: messageInput.trim() }),
        ...(selectedContact.type === "group" && { groupId: selectedContact.groupId }),
        ...(selectedContact.type === "user-mentor" && { collaborationId: selectedContact.collaborationId }),
        ...(selectedContact.type === "user-user" && { userConnectionId: selectedContact.userConnectionId }),
        ...(contentType !== "image" && {
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
      setMessageInput("");
    } catch (error) {
      console.error("Error uploading file:", error);
      setError("Failed to upload file. Please try again.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      inputRef.current?.focus();
    }
  }, [selectedFile, selectedContact, currentUserId, messageInput, onSendMessage, isUploading]);

  // Handle click outside for emoji picker
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSendMessage = useCallback(() => {
    if ((!messageInput.trim() && !selectedFile) || !selectedContact || !currentUserId) return;

    if (selectedFile) {
      handleUpload();
      return;
    }
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    console.log("selectedContact when sending:", selectedContact);
    
    const isSenderUser = selectedContact.userId === currentUserId;
    const targetId =
      selectedContact.type === "group"
        ? selectedContact.groupId
        : isSenderUser
        ? selectedContact.targetId
        : selectedContact.userId;

    const message: IChatMessage & { targetId: string; type: string } = {
      _id: tempId,
      senderId: currentUserId,
      content: messageInput,
      contentType: "text",
      timestamp: new Date().toISOString(),
      targetId,
      type: selectedContact.type,
      isRead: false,
      status: "pending",
      ...(selectedContact.type === "group" && { groupId: selectedContact.groupId }),
      ...(selectedContact.type === "user-mentor" && { collaborationId: selectedContact.collaborationId }),
      ...(selectedContact.type === "user-user" && { userConnectionId: selectedContact.userConnectionId }),
    };

    onSendMessage(message);
  //   socketService.sendMessage({
  //   ...message,
  //   _id: undefined,
  // });
    setMessageInput("");
    inputRef.current?.focus();
  }, [messageInput, selectedFile, selectedContact, currentUserId, onSendMessage, handleUpload]);

  const handleFileSelect = useCallback(
    (file: File) => {
      if (!selectedContact || !currentUserId) return;

      const fileType = file.type;
      const isImage = allowedTypes.image.includes(fileType);
      const isVideo = allowedTypes.video.includes(fileType);
      const isFile = allowedTypes.file.includes(fileType);

      if (!isImage && !isVideo && !isFile) {
        setError(`Unsupported file type. Please upload a valid file.`);
        return;
      }

      const maxSize = isVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
      if (file.size > maxSize) {
        setError(`File is too large. Maximum size is ${isVideo ? "50MB" : "10MB"}.`);
        return;
      }

      setSelectedFile(file);
      setError(null);
      setPreviewUrl(URL.createObjectURL(file));
      inputRef.current?.focus();
    },
    [selectedContact, currentUserId]
  );

  

  const handleRemoveFile = useCallback(() => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const handleEmojiClick = useCallback((emoji: string) => {
    setMessageInput((prev) => prev + emoji);
    inputRef.current?.focus();
  }, []);

  return {
    messageInput,
    setMessageInput,
    selectedFile,
    previewUrl,
    error,
    setError,
    isUploading,
    showEmojiPicker,
    setShowEmojiPicker,
    handleSendMessage,
    handleFileSelect,
    handleRemoveFile,
    handleEmojiClick,
    inputRef,
    fileInputRef,
    emojiPickerRef,
  };
};