import React, { useEffect, useMemo, useRef } from "react";
import { useChatInput } from "../../../../../Hooks/User/Chat/useChatInput";
import TextInput from "./TextInput";
import FileSelector from "./FileSelector";
import FilePreview from "./FilePreview";
import ErrorDisplay from "./ErrorDisplay";
import SendButton from "./SendButton";
import { ChatInputProps } from "./types";
import { socketService } from "../../../../../Service/SocketService";
import { debounce } from "lodash";

const ChatInput: React.FC<ChatInputProps> = ({ selectedContact, currentUserId, onSendMessage, getChatKey }) => {
  const {
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
  } = useChatInput({ selectedContact, currentUserId, onSendMessage });

  const typingTimeoutRef = useRef(null);
  const lastMessageInput = useRef<string>("");

  const emitTyping = useMemo(
  () =>
    debounce((chatKey: string, targetId: string, type: string) => {
      socketService.sendTyping(currentUserId!, targetId, type, chatKey);
    }, 500),
  [currentUserId]
);

const emitStopTyping = useMemo(
  () =>
    debounce((chatKey: string, targetId: string, type: string) => {
      socketService.sendStopTyping(currentUserId!, targetId, type, chatKey);
    }, 1000),
  [currentUserId]
);

useEffect(() => {
  return () => {
    emitTyping.cancel();
    emitStopTyping.cancel();
  };
}, [emitTyping, emitStopTyping]);

  useEffect(() => {
    if (!selectedContact || !currentUserId) return;

    const chatKey = getChatKey(selectedContact);
    const targetId =
      selectedContact.type === "group"
        ? selectedContact.groupId
        : selectedContact.targetId || selectedContact.id;

    if (messageInput.trim() && !lastMessageInput.current.trim()) {
      emitTyping(chatKey, targetId || "", selectedContact.type);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        emitStopTyping(chatKey, targetId || "", selectedContact.type);
      }, 1500);
    } else if (!messageInput.trim() && lastMessageInput.current.trim()) {
      emitStopTyping(chatKey, targetId || "", selectedContact.type);
    }

    lastMessageInput.current = messageInput;

    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [messageInput, selectedContact, currentUserId, getChatKey, emitStopTyping, emitTyping]);

  return (
    <div className="flex flex-col p-2 sm:p-3 bg-white dark:bg-gray-900 border-t border-purple-200 dark:border-gray-800">
      <ErrorDisplay error={error} />
      <FilePreview file={selectedFile} previewUrl={previewUrl} onRemove={handleRemoveFile} />
      <div className="flex items-end gap-1 sm:gap-2 mt-1 relative">
        <FileSelector
          disabled={!selectedContact}
          onFileSelect={handleFileSelect}
          setError={setError}
          fileInputRef={fileInputRef}
        />
        <TextInput
          messageInput={messageInput}
          setMessageInput={setMessageInput}
          showEmojiPicker={showEmojiPicker}
          setShowEmojiPicker={setShowEmojiPicker}
          disabled={!selectedContact}
          onSend={handleSendMessage}
          onEmojiClick={handleEmojiClick}
          inputRef={inputRef}
          emojiPickerRef={emojiPickerRef}
        />
        <SendButton
          isLoading={isUploading}
          disabled={(!messageInput.trim() && !selectedFile) || !selectedContact}
          onClick={handleSendMessage}
        />
      </div>
      {selectedContact?.type === "group" && (
        <div className="mt-2 text-xs text-center text-gray-500 dark:text-gray-400">
          Messaging {selectedContact.name} • {selectedContact.groupDetails?.members.length || 0}{" "}
          members
        </div>
      )}
    </div>
  );
};

export default ChatInput;