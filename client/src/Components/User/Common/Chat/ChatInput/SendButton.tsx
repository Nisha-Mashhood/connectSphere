import React from "react";
import { Button } from "@nextui-org/react";
import { Send } from "lucide-react";
import { SendButtonProps } from "./types";

const SendButton: React.FC<SendButtonProps> = ({ isLoading, disabled, onClick }) => {
  return (
    <Button
      isIconOnly
      color="primary"
      radius="full"
      isLoading={isLoading}
      onPress={onClick}
      disabled={disabled}
      className="min-w-0 w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-violet-500 to-purple-600 shadow-sm"
      aria-label="Send message"
    >
      <Send size={14} />
    </Button>
  );
};

export default SendButton;