import React from "react";
import { Card, CardBody } from "@nextui-org/react";
import { Contact } from "../../../../../types";
import EmptyState from "./EmptyState";
import { useColorScheme } from "./useColorScheme";
import UserMentorDetails from "./UserMentorDetails";
import UserUserDetails from "./UserUserDetails";
import GroupDetails from "./GroupDetails";

interface ChatDetailsSidebarProps {
  selectedContact: Contact | null;
  currentUserId?: string;
}

const ChatDetailsSidebar: React.FC<ChatDetailsSidebarProps> = ({ selectedContact, currentUserId }) => {
  const colors = useColorScheme(selectedContact?.type);

  if (!selectedContact) {
    return <EmptyState />;
  }

  return (
    <Card
      className={`h-full shadow-xl rounded-xl md:rounded-none ${colors.gradient} overflow-hidden border ${colors.border}`}
    >
      <CardBody className="p-0 flex flex-col items-center">
        {selectedContact.type === "user-mentor" && (
          <UserMentorDetails selectedContact={selectedContact} currentUserId={currentUserId} colors={colors} />
        )}
        {selectedContact.type === "user-user" && (
          <UserUserDetails selectedContact={selectedContact} colors={colors} />
        )}
        {selectedContact.type === "group" && (
          <GroupDetails selectedContact={selectedContact} colors={colors} />
        )}
      </CardBody>
    </Card>
  );
};

export default ChatDetailsSidebar;