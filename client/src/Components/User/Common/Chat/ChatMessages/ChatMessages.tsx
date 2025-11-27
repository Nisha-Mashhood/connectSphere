import React, { useMemo } from "react";
import { Spinner } from "@nextui-org/react";
import { MessageSquare } from "lucide-react";

import { Contact } from "../../../../../Interface/User/Icontact";
import { IChatMessage } from "../../../../../Interface/User/IchatMessage";

import { useChatMessages } from "../../../../../Hooks/User/Chat/useChatMessages";
import { useChatScroll } from "../../../../../Hooks/User/Chat/useChatScroll";

import MessageList from "./MessageList";

import "../Chat.css";
import "./ChatMessages.css";
import { getChatKey as buildChatKey } from "../utils/contactUtils";

interface ChatMessagesProps {
  selectedContact: Contact | null;
  currentUserId?: string;
}

const ChatMessages: React.FC<ChatMessagesProps> = ({
  selectedContact,
  currentUserId,
}) => {
  // -----------------------------
  // 1️⃣ CHAT MESSAGE STATE & SOCKET HANDLING
  // -----------------------------
  const {
    allMessages,
    setAllMessages,
    fetchMessages,
  } = useChatMessages();

  // -----------------------------
  // 2️⃣ STABLE GET CHAT KEY (reuse utility)
  // -----------------------------
  const getChatKey = useMemo(
    () => (c: Contact) => buildChatKey(c),
    []
  );

  // -----------------------------
  // 3️⃣ SCROLL HOOK (pagination + scrollToBottom)
  // -----------------------------
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const {
    messagesContainerRef,
    isFetching,
    initialLoadDone,
    showScrollDown,
    scrollToBottom,
  } = useChatScroll({
    selectedContact,
    getChatKey,
    allMessages,
    setAllMessages,
    fetchMessages,
    messagesEndRef,
  });

  // -----------------------------
  // 4️⃣ GROUP MESSAGES BY DATE
  // -----------------------------
  const groupMessagesByDate = (messages?: IChatMessage[]) => {
    if (!messages) return [];

    const groups: { date: string; messages: IChatMessage[] }[] = [];
    let lastDate = "";

    messages.forEach((msg) => {
      const d = new Date(msg.timestamp).toDateString();

      if (d !== lastDate) {
        lastDate = d;
        groups.push({
          date: new Date(msg.timestamp).toISOString(),
          messages: [msg],
        });
      } else {
        groups[groups.length - 1].messages.push(msg);
      }
    });
    return groups;
  };

  // -----------------------------
  // 5️⃣ GET SENDER INFO
  // -----------------------------
  const getMessageSender = (msg: IChatMessage) => {
    if (msg.senderId === currentUserId) {
      return {
        name: "You",
        profilePic: undefined,
        isSelf: true,
      };
    }

    if (selectedContact?.type === "group") {
      const member = selectedContact.groupDetails?.members.find(
        (m) => m.userId === msg.senderId
      );
      return member
        ? {
            name: member.name,
            profilePic: member.profilePic,
            isSelf: false,
          }
        : { name: "Unknown", isSelf: false };
    }

    return {
      name: selectedContact?.name || "Unknown",
      profilePic: selectedContact?.profilePic,
      isSelf: false,
    };
  };

  // -----------------------------
  // 6️⃣ TIME + DATE FORMATTERS
  // -----------------------------
  const formatTime = (ts: string | Date) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (ts: string | Date) => {
    const d = new Date(ts);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === today.toDateString()) return "Today";
    if (d.toDateString() === yesterday.toDateString()) return "Yesterday";

    return d.toLocaleDateString(undefined, {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
  };

  // -----------------------------
  // 7️⃣ RENDER
  // -----------------------------
  const groupedMessages = useMemo(() => {
    if (!selectedContact) return [];
    const chatKey = getChatKey(selectedContact);
    return groupMessagesByDate(allMessages.get(chatKey));
  }, [allMessages, selectedContact, getChatKey]);

  return (
    <div className="flex flex-col flex-grow relative overflow-hidden h-full">
      {/* MESSAGE LIST */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto mb-4 flex flex-col p-3 space-y-3 scrollbar-thin"
      >
        {/* Loading */}
        {isFetching && (
          <div className="flex justify-center p-2">
            <Spinner size="sm" color="primary" />
          </div>
        )}

        {/* No contact selected */}
        {!selectedContact && (
          <div className="flex-1 flex flex-col items-center justify-center">
            <MessageSquare className="text-blue-400 mb-2" />
            <p className="text-gray-600">Select a contact to start chatting</p>
          </div>
        )}

        {/* No messages */}
        {selectedContact &&
          groupedMessages.length === 0 &&
          initialLoadDone &&
          !isFetching && (
            <div className="flex-1 flex flex-col items-center justify-center">
              <MessageSquare className="text-gray-400 mb-2" />
              <p className="text-gray-500">No messages yet</p>
            </div>
          )}

        {/* Message list */}
        {selectedContact && (
          <MessageList
            groupedMessages={groupedMessages}
            selectedContact={selectedContact}
            getMessageSender={getMessageSender}
            formatDate={formatDate}
            formatTime={formatTime}
          />
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Scroll Down Button */}
      {showScrollDown && (
        <button
          className="absolute bottom-3 right-3 p-2 bg-gray-200 dark:bg-gray-700 rounded-full shadow"
          onClick={scrollToBottom}
        >
          ↓
        </button>
      )}
    </div>
  );
};

export default ChatMessages;
