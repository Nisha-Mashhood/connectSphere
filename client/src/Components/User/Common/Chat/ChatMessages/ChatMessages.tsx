import React from "react";
import { Spinner } from "@nextui-org/react";
import { Contact } from "../../../../../Interface/User/Icontact";
import { IChatMessage } from "../../../../../Interface/User/IchatMessage";
import MessageList from "./MessageList";
import "../Chat.css";
import "./ChatMessages.css";
import { useChatMessagesView } from "../../../../../Hooks/User/Chat/useChatMessagesView";

interface ChatMessagesProps {
  selectedContact: Contact | null;
  currentUserId?: string;
  allMessages: Map<string, IChatMessage[]>;
  setAllMessages: React.Dispatch<
    React.SetStateAction<Map<string, IChatMessage[]>>
  >;
  fetchMessages: (
    contact: Contact,
    page: number,
    signal?: AbortSignal
  ) => Promise<{ messages: IChatMessage[]; total: number }>;
}

const ChatMessages: React.FC<ChatMessagesProps> = ({
  selectedContact,
  currentUserId,
  allMessages,
  setAllMessages,
  fetchMessages,
}) => {
  const {
    messagesContainerRef,
    messagesEndRef,
    isAtBottom,
    scrollToBottom,
    handleContainerScroll,
    groupedMessages,
    isLoading,
    isFetchingOlder,
    unreadWhileAway,
    getMessageSender,
    formatDate,
    formatTime,
  } = useChatMessagesView({
    selectedContact,
    currentUserId,
    allMessages,
    setAllMessages,
    fetchMessages,
  });

  return (
    <div className="flex flex-col flex-grow relative overflow-hidden h-full">
      {/* MESSAGE LIST */}
      <div
        ref={messagesContainerRef}
        onScroll={handleContainerScroll}
        className="flex-1 overflow-y-auto mb-4 flex flex-col p-3 space-y-3 scrollbar-thin"
      >
        {/* Initial loading ONLY when contact is changed */}
        {isLoading && (
          <div className="flex justify-center p-2">
            <Spinner size="sm" color="primary" />
          </div>
        )}

        {/* Loading older messages (when scrolled to top) */}
        {!isLoading && isFetchingOlder && (
          <div className="flex justify-center items-center gap-2 py-2 text-xs text-gray-500">
            <Spinner size="sm" color="default" />
            <span>Loading older messages…</span>
          </div>
        )}

        {/* No contact selected */}
        {!selectedContact && !isLoading && (
          <div className="flex-1 flex flex-col items-center justify-center">
            <p className="text-gray-600">Select a contact to start chatting</p>
          </div>
        )}

        {/* No messages */}
        {selectedContact && groupedMessages.length === 0 && !isLoading && (
          <div className="flex-1 flex flex-col items-center justify-center">
            <p className="text-gray-500">No messages yet</p>
          </div>
        )}

        {/* Message list */}
        {selectedContact && groupedMessages.length > 0 && (
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

      {/* Scroll-to-latest button */}
      {!isAtBottom && (
        <button
          className="absolute bottom-3 right-3 px-3 py-2 rounded-full shadow-lg 
               bg-purple-600 text-black flex items-center gap-2 
               transition-all duration-200 group"
          onClick={() => {
            scrollToBottom("smooth");
          }}
        >
          {/* Arrow icon */}
          <span className="text-lg font-bold">↓</span>
          {unreadWhileAway > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-white text-purple-700 text-xs font-semibold">
              {unreadWhileAway}
            </span>
          )}
          <span className="hidden group-hover:inline text-xs font-medium">
            {unreadWhileAway > 0 ? "new" : "Latest"}
          </span>
        </button>
      )}
    </div>
  );
};

export default ChatMessages;