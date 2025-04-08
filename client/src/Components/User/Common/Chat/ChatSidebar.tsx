import React from "react";
import { Card, CardBody, Avatar } from "@nextui-org/react";
import { Contact, Notification } from "../../../../types";

interface ChatSidebarProps {
  contacts: Contact[];
  selectedContact: Contact | null;
  onContactSelect: (contact: Contact) => void;
  notifications: Notification[];
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  contacts,
  selectedContact,
  onContactSelect,
  notifications,
}) => (
  <Card className="w-1/4 mr-4">
    <CardBody>
      <h2 className="text-lg font-semibold mb-4">Contacts</h2>
      {contacts.length === 0 ? (
        <p className="text-gray-500">No contacts found</p>
      ) : (
        contacts.map((contact) => (
          <div
            key={`${contact.type}_${contact.id}`}
            className={`flex items-center p-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${
              selectedContact?.id === contact.id && selectedContact?.type === contact.type
                ? "bg-gray-200 dark:bg-gray-600"
                : ""
            }`}
            onClick={() => onContactSelect(contact)}
          >
            <Avatar src={contact.profilePic} size="sm" className="mr-2" />
            <span>
              {contact.name} ({contact.type})
              {notifications.some((n) => n.contactId === contact.id && n.type === contact.type) && (
                <span className="ml-2 text-red-500">●</span>
              )}
            </span>
          </div>
        ))
      )}
    </CardBody>
  </Card>
);

export default ChatSidebar;