import { IChatMessage } from "../../../../../Interface/User/IchatMessage";
import { Contact } from "../../../../../Interface/User/Icontact";

export interface ChatInputProps {
  selectedContact: Contact | null;
  currentUserId?: string;
  onSendMessage: (message: IChatMessage & { targetId: string; type: string }) => void;
  getChatKey: (contact: Contact) => string
}

export interface TextInputProps {
  messageInput: string;
  setMessageInput: (value: string) => void;
  showEmojiPicker: boolean;
  setShowEmojiPicker: (value: boolean) => void;
  disabled: boolean;
  onSend: () => void;
  onEmojiClick: (emoji: string) => void;
  inputRef: React.RefObject<HTMLTextAreaElement>;
  emojiPickerRef: React.RefObject<HTMLDivElement>;
}

export interface FileSelectorProps {
  disabled: boolean;
  onFileSelect: (file: File) => void;
  setError: (error: string | null) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
}

export interface FilePreviewProps {
  file: File | null;
  previewUrl: string | null;
  onRemove: () => void;
}

export interface ErrorDisplayProps {
  error: string | null;
}

export interface SendButtonProps {
  isLoading: boolean;
  disabled: boolean;
  onClick: () => void;
}

export interface UseChatInputReturn {
  messageInput: string;
  setMessageInput: (value: string) => void;
  selectedFile: File | null;
  previewUrl: string | null;
  error: string | null;
  setError: (error: string | null) => void;
  isUploading: boolean;
  showEmojiPicker: boolean;
  setShowEmojiPicker: (value: boolean) => void;
  handleSendMessage: () => void;
  handleFileSelect: (file: File) => void;
  handleRemoveFile: () => void;
  handleEmojiClick: (emoji: string) => void;
  inputRef: React.RefObject<HTMLTextAreaElement>;
  fileInputRef: React.RefObject<HTMLInputElement>;
  emojiPickerRef: React.RefObject<HTMLDivElement>;
}