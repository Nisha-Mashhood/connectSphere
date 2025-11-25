import React from "react";
import { Card, CardBody } from "@nextui-org/react";
import EmptyState from "./EmptyState";
import { useColorScheme } from "./useColorScheme";
import UserMentorDetails from "./UserMentorDetails";
import UserUserDetails from "./UserUserDetails";
import GroupDetails from "./GroupDetails";
import { Contact } from "../../../../../Interface/User/Icontact";

interface ChatDetailsSidebarProps {
  selectedContact: Contact | null;
  currentUserId?: string;
  isOverlay?: boolean;
  onClose?: () => void;
}

const ChatDetailsSidebar: React.FC<ChatDetailsSidebarProps> = ({
  selectedContact,
  currentUserId,
  isOverlay = false,
  onClose,
}) => {
  const colors = useColorScheme(selectedContact?.type);

  if (!selectedContact) {
    return <EmptyState />;
  }

  return (
    <Card
      className={`relative h-full shadow-xl rounded-xl md:rounded-none ${colors.gradient} overflow-hidden border ${colors.border}`}
    >   
      {isOverlay && (
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-50 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full"
        >
          ✕
        </button>
      )}

      <CardBody className="p-0 flex flex-col items-center">
        {selectedContact.type === "user-mentor" && (
          <UserMentorDetails
            selectedContact={selectedContact}
            currentUserId={currentUserId}
            colors={colors}
          />
        )}

        {selectedContact.type === "user-user" && (
          <UserUserDetails
            selectedContact={selectedContact}
            colors={colors}
          />
        )}

        {selectedContact.type === "group" && (
          <GroupDetails
            selectedContact={selectedContact}
            colors={colors}
          />
        )}
      </CardBody>
    </Card>
  );
};

export default ChatDetailsSidebar;