import React from "react";
import { Button } from "@nextui-org/react";
import { FaArrowLeft, FaPhone, FaVideo } from "react-icons/fa";
import { Contact } from "../../../../types";

interface ChatHeaderProps {
  type?: string; // Determines if the back button should be shown
  selectedContact: Contact | null; // Currently selected contact for the chat
  navigate: (path: string) => void; // Function to navigate to a different route
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ type, selectedContact, navigate }) => (
  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-500 to-purple-500 dark:from-blue-700 dark:to-purple-700 text-white rounded-t-xl shadow-md">
    
    {/* Left side: Back button (if applicable) + Contact name */}
    <div className="flex items-center">
      {type && (
        <Button
          isIconOnly
          variant="light"
          onPress={() => navigate("/chat")}
          className="mr-3 text-white hover:bg-white/20"
        >
          <FaArrowLeft />
        </Button>
      )}
      <h2 className="text-lg font-semibold">
        {selectedContact ? selectedContact.name : "Select a contact to chat"}
      </h2>
    </div>

    {/* Right side: Call action buttons (only when a contact is selected) */}
    {selectedContact && (
      <div className="flex space-x-2">
        <Button
          isIconOnly
          color="success"
          onPress={() => alert("Audio call feature coming soon!")}
          className="hover:scale-105 transition-transform"
        >
          <FaPhone />
        </Button>
        <Button
          isIconOnly
          color="primary"
          onPress={() => alert("Video call feature coming soon!")}
          className="hover:scale-105 transition-transform"
        >
          <FaVideo />
        </Button>
      </div>
    )}
  </div>
);

export default ChatHeader;
