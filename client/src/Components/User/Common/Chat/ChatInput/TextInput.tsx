import React from "react";
import { Button } from "@nextui-org/react";
import { Smile } from "lucide-react";
import EmojiPicker from "emoji-picker-react";
import { TextInputProps } from "./types";

const TextInput: React.FC<TextInputProps> = ({
  messageInput,
  setMessageInput,
  showEmojiPicker,
  setShowEmojiPicker,
  disabled,
  onSend,
  onEmojiClick,
  inputRef,
  emojiPickerRef,
}) => {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="relative flex-1 min-h-10">
      <textarea
        ref={inputRef}
        placeholder={disabled ? "Select a contact to start chatting" : "Type a message..."}
        value={messageInput}
        onChange={(e) => setMessageInput(e.target.value)}
        onKeyDown={handleKeyPress}
        rows={1}
        disabled={disabled}
        className="w-full p-2 sm:p-3 pr-10 rounded-2xl resize-none bg-purple-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-400 dark:focus:ring-purple-600 placeholder:text-gray-500 dark:placeholder:text-gray-400 transition-all border border-purple-100 dark:border-gray-700 text-sm sm:text-base"
        style={{ maxHeight: "120px" }}
      />
      <Button
        isIconOnly
        variant="light"
        radius="full"
        size="sm"
        className="absolute right-2 bottom-2 min-w-0 w-6 h-6 sm:w-8 sm:h-8 text-purple-500 dark:text-purple-400"
        onPress={() => setShowEmojiPicker(!showEmojiPicker)}
        disabled={disabled}
        aria-label="Toggle emoji picker"
      >
        <Smile size={14} />
      </Button>
      {showEmojiPicker && (
        <div ref={emojiPickerRef} className="absolute bottom-12 right-0 z-10 shadow-lg rounded-lg">
          <EmojiPicker onEmojiClick={(emojiData) => onEmojiClick(emojiData.emoji)} />
        </div>
      )}
    </div>
  );
};

export default TextInput;