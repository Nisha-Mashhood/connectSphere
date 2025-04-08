import React from "react";
import { Card, CardBody, Avatar } from "@nextui-org/react"; 
import { Contact, Notification } from "../../../../types"; 

// Props definition for the ChatSidebar component
interface ChatSidebarProps {
  contacts: Contact[];                    // List of contact users
  selectedContact: Contact | null;       // Currently selected contact in chat
  onContactSelect: (contact: Contact) => void; // Function to call when a contact is selected
  notifications: Notification[];         // List of unread notifications (with contactId)
}

// Functional component definition
const ChatSidebar: React.FC<ChatSidebarProps> = ({
  contacts,
  selectedContact,
  onContactSelect,
  notifications,
}) => (
  <Card className="w-1/4 mr-4 shadow-lg rounded-xl bg-white dark:bg-gray-900">
    <CardBody className="p-4">
      {/* Sidebar title */}
      <h2 className="text-xl font-bold mb-4 text-blue-600 dark:text-blue-400">Chats</h2>

      {contacts.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">No contacts found</p>
      ) : (
        contacts.map((contact) => (
          <div
            key={contact.id}
            className={`flex items-center p-3 mb-2 rounded-lg cursor-pointer transition-all duration-200 hover:bg-blue-100 dark:hover:bg-gray-700 ${
              selectedContact?.id === contact.id ? "bg-blue-200 dark:bg-gray-600" : ""
            }`}
            onClick={() => onContactSelect(contact)} 
          >
            {/* Contact's profile picture */}
            <Avatar src={contact.profilePic} size="md" className="mr-3" />

            <span className="text-gray-800 dark:text-gray-200 font-medium">
              {contact.name}
              {notifications.some((n) => n.contactId === contact.id) && (
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
