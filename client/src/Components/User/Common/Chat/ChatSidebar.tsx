import React, { useEffect, useState } from "react";
import { Card, CardBody, Avatar, Input, Chip, Tabs, Tab, Badge } from "@nextui-org/react";
import { FaSearch, FaUserFriends, FaUsers, FaGraduationCap, FaPhone, FaVideo, FaPhoneSlash, FaArrowUp, FaArrowDown } from "react-icons/fa";
import { Contact, ICallLog, IChatMessage, Notification } from "../../../../types";
import { getChatKey } from "./utils/contactUtils";
import { isValid, parseISO, format } from 'date-fns';

interface ChatSidebarProps {
  contacts: Contact[];
  selectedContact: Contact | null;
  onContactSelect: (contact: Contact) => void;
  chatNotifications: Notification[];
  unreadCounts: { [key: string]: number };
  lastMessages: { [key: string]: IChatMessage | null };
  currentUserId: string;
  callLogs: ICallLog[];
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  contacts,
  selectedContact,
  onContactSelect,
  chatNotifications,
  unreadCounts,
  lastMessages,
  currentUserId,
  callLogs,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");

  const getCallDirection = (callLog: ICallLog): "incoming" | "outgoing" => {
    return (typeof callLog.senderId === "string"
      ? callLog.senderId === currentUserId
      : callLog.senderId._id === currentUserId)
      ? "outgoing"
      : "incoming";
  };

  const filteredContacts = contacts.filter((contact) => {
    const matchesSearch = contact.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === "all" || contact.type === selectedType;
    return matchesSearch && matchesType;
  });

  const filteredCallLogs = callLogs.filter((callLog) => {
    // Check if the current user is involved in this call
    const isUserInvolved =
      (typeof callLog.senderId === "string"
        ? callLog.senderId === currentUserId
        : callLog.senderId._id === currentUserId) ||
      callLog.recipientIds.some(recipient =>
        typeof recipient === "string"
          ? recipient === currentUserId
          : recipient._id === currentUserId
      );

    if (!isUserInvolved) return false;

    // Apply search filter
    const callerName = typeof callLog.senderId === "string"
      ? callLog.callerName || ""
      : callLog.senderId.name || callLog.callerName || "";
    const recipientNames = callLog.recipientIds
      .map(r => (typeof r === "string" ? "" : r.name || ""))
      .join(" ");
    const searchText = `${callerName} ${recipientNames}`.toLowerCase();
    return searchText.includes(searchQuery.toLowerCase());
  });

  const userUserCount = contacts.filter((c) => c.type === "user-user").length;
  const userMentorCount = contacts.filter((c) => c.type === "user-mentor").length;
  const groupCount = contacts.filter((c) => c.type === "group").length;
  const callLogCount = filteredCallLogs.length;

  useEffect(() => {
    console.log("Call Logs in ChatSidebar:", JSON.stringify(callLogs, null, 2));
    console.log("Current User ID:", currentUserId);
    console.log("Filtered Call Logs:", JSON.stringify(filteredCallLogs, null, 2));
  }, [callLogs, currentUserId, filteredCallLogs]);

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

  const getCallStatusIcon = (callLog: ICallLog) => {
    const direction = getCallDirection(callLog);
    if (callLog.status === "missed") {
      return <FaPhoneSlash className="text-red-500" size={12} />;
    }
    if (direction === "incoming") {
      return <FaArrowDown className="text-green-500" size={12} />;
    }
    return <FaArrowUp className="text-blue-500" size={12} />;
  };

  const getCallTypeIcon = (callType: string) => {
    return callType === "video" ? 
      <FaVideo className="text-purple-500" size={12} /> : 
      <FaPhone className="text-gray-500" size={12} />;
  };

  const formatCallTime = (dateStr: string | Date) => {
    const date = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
    if (!isValid(date)) return '';
    
    const now = new Date();
    if (
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    ) {
      return format(date, 'h:mm a');
    } else {
      return format(date, 'MMM d, h:mm a');
    }
  };

  const formatMessageTime = (dateStr: string | undefined) => {
    if (!dateStr) return ''; 
    const date = parseISO(dateStr);
    if (!isValid(date)) {
      console.warn('Invalid date received:', dateStr);
      return ''; 
    }
    const now = new Date();
    if (
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    ) {
      return format(date, 'h:mm a'); 
    } else {
      return format(date, 'MMM d');
    }
  };

  const getMessagePreview = (lastMessage: IChatMessage | null, contactType: string) => {
    if (!lastMessage) return "No messages yet";

    let preview = lastMessage.content || "";
    if ((lastMessage as IChatMessage).contentType === "image") {
      preview = "Sent a photo";
    } else if ((lastMessage as IChatMessage).contentType === "video") {
      preview = "Sent a video";
    } else if((lastMessage as IChatMessage).contentType === "file"){
      preview = 'Sent a file';
    }

    const prefix =
      lastMessage.senderId === currentUserId && contactType !== "group" ? "You: " : "";

    const truncated = preview.substring(0, 40) + (preview.length > 40 ? "..." : "");
    return prefix + truncated;
  };

  const getCallParticipantName = (callLog: ICallLog) => {
    if (callLog.type === "group") {
      return `Group Call (${callLog.recipientIds.length + 1} participants)`;
    }

    const isSender = typeof callLog.senderId === "string"
      ? callLog.senderId === currentUserId
      : callLog.senderId._id === currentUserId;
    
    if (isSender) {
      const recipient = callLog.recipientIds[0];
      return typeof recipient === "string" ? callLog.callerName || "Unknown" : recipient.name || "Unknown";
    } else {
      return typeof callLog.senderId === "string" ? callLog.callerName || "Unknown" : callLog.senderId.name || callLog.callerName || "Unknown";
    }
  };

  const getCallParticipantAvatar = (callLog: ICallLog) => {
    const direction = getCallDirection(callLog);
    if (direction === "outgoing") {
      const recipient = callLog.recipientIds[0];
      return typeof recipient === "string" ? "" : recipient.profilePic || "";
    } else {
      return typeof callLog.senderId === "string" ? "" : callLog.senderId.profilePic || "";
    }
  };

  const formatCallDuration = (callLog: ICallLog) => {
    if (callLog.duration) {
      const minutes = Math.floor(callLog.duration / 60);
      const seconds = callLog.duration % 60;
      return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    }
    if (callLog.startTime && callLog.endTime) {
      const start = new Date(callLog.startTime);
      const end = new Date(callLog.endTime);
      const duration = Math.round((end.getTime() - start.getTime()) / 1000);
      return `${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, "0")}`;
    }
    return "0:00";
  };

  const getCallStatusText = (callLog: ICallLog) => {
    const direction = getCallDirection(callLog);
    if (callLog.status === "missed") {
      return direction === "incoming" ? "Missed Incoming Call" : "Missed Outgoing Call";
    }
    return direction === "incoming" ? "Incoming Call" : "Outgoing Call";
  };

  const renderCallLogContent = () => {
    console.log("Rendering filteredCallLogs:", JSON.stringify(filteredCallLogs, null, 2));
    if (filteredCallLogs.length === 0) {
      return (
        <div className="text-center py-8 sm:py-10">
          <FaPhone className="mx-auto text-gray-300 dark:text-gray-600 text-3xl mb-3" />
          <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
            No call history found
          </p>
          <p className="text-xs sm:text-sm text-gray-400 dark:text-gray-500 mt-1">
            {searchQuery ? "Try a different search term" : "Make your first call"}
          </p>
        </div>
      );
    }

    return filteredCallLogs.map((callLog) => (
      <div
        key={callLog._id.toString()}
        className="flex items-center p-2 sm:p-3 rounded-xl cursor-pointer transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800/50"
      >
        <div className="relative mr-3">
          <Avatar
            src={getCallParticipantAvatar(callLog)}
            size="sm"
            className="w-8 h-8 sm:w-10 sm:h-10"
            color={
              callLog.type === "user-mentor"
                ? "primary"
                : callLog.type === "group"
                ? "success"
                : "secondary"
            }
          />
          <div className="absolute -bottom-1 -right-1 bg-white dark:bg-gray-900 rounded-full p-0.5">
            {getCallTypeIcon(callLog.callType)}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <p className="font-medium text-gray-800 dark:text-gray-200 truncate text-sm sm:text-base">
                {getCallParticipantName(callLog)}
              </p>
              {getCallStatusIcon(callLog)}
            </div>
            <div className="ml-2 flex-shrink-0">{getContactIcon(callLog.type)}</div>
          </div>
          
          <div className="flex justify-between items-center mt-1">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {getCallStatusText(callLog)}
              </span>
              {callLog.status === "completed" && (callLog.duration || (callLog.startTime && callLog.endTime)) && (
                <>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formatCallDuration(callLog)}
                  </span>
                </>
              )}
            </div>
            <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">
              {formatCallTime(callLog.startTime)}
            </span>
          </div>
        </div>
      </div>
    ));
  };

  const renderContactContent = () => {
    if (filteredContacts.length === 0) {
      return (
        <div className="text-center py-8 sm:py-10">
          <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
            No conversations found
          </p>
          <p className="text-xs sm:text-sm text-gray-400 dark:text-gray-500 mt-1">
            {searchQuery ? "Try a different search term" : "Start a new conversation"}
          </p>
        </div>
      );
    }

    return filteredContacts.map((contact) => {
      const chatKey = getChatKey(contact);
      const unreadCount = unreadCounts[chatKey] || 0;
      const hasNotification = chatNotifications.some(
        n => n.relatedId === chatKey && n.status === "unread"
      );
      const lastMessage = lastMessages[chatKey];
      
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
            <div className="flex justify-between items-center mt-1">
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate flex-1 mr-2">
                {getMessagePreview(lastMessage, contact.type)}
              </p>
              {lastMessage && (
                <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">
                  {formatMessageTime(lastMessage.createdAt)}
                </span>
              )}
            </div>
          </div>
        </div>
      );
    });
  };

  return (
    <Card key={callLogs.length} className="h-full shadow-lg rounded-xl md:rounded-none bg-white dark:bg-gray-900 border border-indigo-100 dark:border-purple-900">
      <CardBody className="p-0 flex flex-col h-full">
        <div className="p-3 sm:p-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-t-xl">
          <h2 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">
            {selectedType === "calls" ? "Call History" : "Messages"}
          </h2>
          <Input
            placeholder={selectedType === "calls" ? "Search call history..." : "Search conversations..."}
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
              <div className="flex-col items-center gap-2">
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
          <Tab
            key="calls"
            title={
              <div className="flex items-center gap-2">
                <FaPhone size={14} />
                <Chip size="sm" variant="flat" color="warning">
                  {callLogCount}
                </Chip>
              </div>
            }
          />
        </Tabs>

        <div className="flex-1 overflow-y-auto p-2 sm:p-3 space-y-2">
          {selectedType === "calls" ? renderCallLogContent() : renderContactContent()}
        </div>
      </CardBody>
    </Card>
  );
};

export default ChatSidebar;