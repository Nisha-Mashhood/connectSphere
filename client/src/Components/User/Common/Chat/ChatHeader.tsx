import React from "react";
import { Button } from "@nextui-org/react";
import { FaArrowLeft } from "react-icons/fa";
import { Contact } from "../../../../types";

interface ChatHeaderProps {
  type?: string;
  selectedContact: Contact | null;
  navigate: (path: string) => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ type, selectedContact, navigate }) => (
  <div className="flex items-center justify-between mb-4">
    <div className="flex items-center">
      {type && (
        <Button isIconOnly variant="light" onPress={() => navigate("/chat")} className="mr-2">
          <FaArrowLeft />
        </Button>
      )}
      <h2 className="text-lg font-semibold">
      {selectedContact ? `${selectedContact.name} (${selectedContact.type})` : "Select a contact to chat"}
      </h2>
    </div>
  </div>
);

export default ChatHeader;