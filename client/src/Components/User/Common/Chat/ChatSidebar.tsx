import React, { useState } from "react";
import { Card, CardBody, Avatar, Input, Chip, Tabs, Tab, Badge } from "@nextui-org/react";
import { Contact, Notification } from "../../../../types";
import { FaSearch, FaUserFriends, FaUsers, FaGraduationCap, FaRegDotCircle } from "react-icons/fa";
import { getChatKey } from "./utils/contactUtils";

interface ChatSidebarProps {
  contacts: Contact[];
  selectedContact: Contact | null;
  onContactSelect: (contact: Contact) => void;
  notifications: Notification[];
  unreadCounts: { [key: string]: number };
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  contacts,
  selectedContact,
  onContactSelect,
  notifications,
  unreadCounts,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");

  const filteredContacts = contacts.filter((contact) => {
    const matchesSearch = contact.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === "all" || contact.type === selectedType;
    return matchesSearch && matchesType;
  });

  const userUserCount = contacts.filter((c) => c.type === "user-user").length;
  const userMentorCount = contacts.filter((c) => c.type === "user-mentor").length;
  const groupCount = contacts.filter((c) => c.type === "group").length;

  const getContactBgColor = (contact: Contact) => {
    const isSelected = selectedContact?.id === contact.id;
    if (isSelected) {
      switch (contact.type) {
        case "user-mentor":
          return "bg-blue-100 dark:bg-blue-900/40";
        case "user-user":
          return "bg-purple-100 dark:bg-purple-900/40";
        case "group":
          return "bg-emerald-100 dark:bg-emerald-900/40";
        default:
          return "bg-gray-100 dark:bg-gray-800";
      }
    }
    return "hover:bg-gray-100 dark:hover:bg-gray-800";
  };

  const getContactIcon = (type: string) => {
    switch (type) {
      case "user-mentor":
        return <FaGraduationCap className="text-blue-500" />;
      case "user-user":
        return <FaUserFriends className="text-purple-500" />;
      case "group":
        return <FaUsers className="text-emerald-500" />;
      default:
        return null;
    }
  };

  return (
    <Card className="h-full shadow-lg rounded-xl md:rounded-none bg-white dark:bg-gray-900 border border-indigo-100 dark:border-purple-900">
      <CardBody className="p-0 flex flex-col h-full">
        <div className="p-3 sm:p-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-t-xl">
          <h2 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">Messages</h2>
          <Input
            placeholder="Search conversations..."
            startContent={<FaSearch />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            classNames={{
              input: "text-white text-sm sm:text-base",
              inputWrapper: "bg-white/20 hover:bg-white/30 shadow-md",
            }}
            variant="flat"
            size="sm"
          />
        </div>

        <Tabs
          aria-label="Contact types"
          className="px-2 pt-2"
          selectedKey={selectedType}
          onSelectionChange={(key) => setSelectedType(key as string)}
          color="secondary"
          variant="underlined"
          classNames={{
            tabList: "gap-2",
            cursor: "bg-gradient-to-r from-indigo-500 to-purple-500",
          }}
        >
          <Tab
            key="all"
            title={
              <div className=" flex-col items-center gap-2">
                <span className="text-xs sm:text-sm">All</span>
                <Chip size="sm" variant="flat" color="secondary">
                  {contacts.length}
                </Chip>
              </div>
            }
          />
          <Tab
            key="user-user"
            title={
              <div className="flex items-center gap-2">
                <FaUserFriends size={14} />
                <Chip size="sm" variant="flat" color="secondary">
                  {userUserCount}
                </Chip>
              </div>
            }
          />
          <Tab
            key="user-mentor"
            title={
              <div className="flex items-center gap-2">
                <FaGraduationCap size={14} />
                <Chip size="sm" variant="flat" color="primary">
                  {userMentorCount}
                </Chip>
              </div>
            }
          />
          <Tab
            key="group"
            title={
              <div className="flex items-center gap-2">
                <FaUsers size={14} />
                <Chip size="sm" variant="flat" color="success">
                  {groupCount}
                </Chip>
              </div>
            }
          />
        </Tabs>

        <div className="flex-1 overflow-y-auto p-2 sm:p-3 space-y-2">
          {filteredContacts.length === 0 ? (
            <div className="text-center py-8 sm:py-10">
              <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
                No conversations found
              </p>
              <p className="text-xs sm:text-sm text-gray-400 dark:text-gray-500 mt-1">
                {searchQuery ? "Try a different search term" : "Start a new conversation"}
              </p>
            </div>
          ) : (
            filteredContacts.map((contact) => {
              const hasNotification = notifications.some((n) => n.contactId === contact.id);
              const chatKey = getChatKey(contact);
              const unreadCount = unreadCounts[chatKey] || 0;

              return (
                <div
                  key={contact.id}
                  className={`flex items-center p-2 sm:p-3 rounded-xl cursor-pointer transition-all duration-200 ${getContactBgColor(
                    contact
                  )}`}
                  onClick={() => onContactSelect(contact)}
                >
                  <div className="relative">
                  <Badge content={unreadCount > 0 ? unreadCount : null} color="primary">
                    <Avatar
                      src={contact.profilePic}
                      size="md"
                      className="mr-2 sm:mr-3 w-8 h-8 sm:w-10 sm:h-10"
                      isBordered={selectedContact?.id === contact.id}
                      color={
                        contact.type === "user-mentor"
                          ? "primary"
                          : contact.type === "group"
                          ? "success"
                          : "secondary"
                      }
                    />
                    </Badge>
                    {hasNotification && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-red-500 rounded-full animate-pulse" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-gray-800 dark:text-gray-200 truncate text-sm sm:text-base">
                        {contact.name}
                      </p>
                      <div className="ml-2 flex-shrink-0">{getContactIcon(contact.type)}</div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {contact.type === "user-mentor"
                        ? "Mentorship"
                        : contact.type === "group"
                        ? `${contact.groupDetails?.members.length || 0} members`
                        : contact.targetJobTitle || "Connection"}
                    </p>
                  </div>

                  {hasNotification && (
                    <FaRegDotCircle className="text-red-500 ml-2 animate-pulse" size={12} />
                  )}
                </div>
              );
            })
          )}
        </div>
      </CardBody>
    </Card>
  );
};

export default ChatSidebar;