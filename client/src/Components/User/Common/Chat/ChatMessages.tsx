import React, { useEffect, useRef, useCallback, useState } from "react";
import { debounce } from "lodash";
import { Contact, IChatMessage, Notification } from "../../../../types";
import { fetchChatMessages } from "../../../../Service/Chat.Service";
import { Avatar } from "@nextui-org/react";
import { useSelector } from "react-redux";
import { RootState } from "../../../../redux/store";

// Props interface for ChatMessages component
interface ChatMessagesProps {
  selectedContact: Contact | null;
  allMessages: Map<string, IChatMessage[]>;
  getChatKey: (contact: Contact) => string;
  currentUserId?: string;
  notifications: Notification[];
  onNotificationClick: (contact: Contact) => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  contacts: Contact[];
}

// Functional Component for rendering chat messages
const ChatMessages: React.FC<ChatMessagesProps> = ({
  selectedContact,
  allMessages,
  getChatKey,
  currentUserId,
  notifications,
  onNotificationClick,
  messagesEndRef,
  contacts,
}) => {
  const { currentUser } = useSelector((state: RootState) => state.user);

  // Refs & States
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  /**
   * Loads chat messages with pagination
   */
  const loadMessages = useCallback(
    async (resetPage = false) => {
      if (!selectedContact || isFetching || (!hasMore && !resetPage)) return;

      const chatKey = getChatKey(selectedContact);
      const container = messagesContainerRef.current;
      const previousScrollHeight = container?.scrollHeight || 0;

      setIsFetching(true);
      const currentPage = resetPage ? 1 : page;

      try {
        const { messages: newMessages, total } = await fetchChatMessages(
          selectedContact.type !== "group" ? selectedContact.contactId : undefined,
          selectedContact.type === "group" ? selectedContact.groupId : undefined,
          currentPage
        );

        const updatedMessages = resetPage
          ? newMessages
          : [...newMessages, ...(allMessages.get(chatKey) || [])];

        allMessages.set(chatKey, updatedMessages);
        setHasMore(currentPage * 10 < total);
        setPage(currentPage + 1);
        if (resetPage) setInitialLoadDone(true);

        // Maintain scroll position after loading previous messages
        if (!resetPage && container) {
          const newScrollHeight = container.scrollHeight;
          container.scrollTop = newScrollHeight - previousScrollHeight;
        }
      } catch (error) {
        console.error("Error loading messages:", error);
      } finally {
        setIsFetching(false);
      }
    },
    [selectedContact, page, isFetching, hasMore, allMessages, getChatKey]
  );

  // Load messages on contact change
  useEffect(() => {
    if (selectedContact && !initialLoadDone) {
      setPage(1);
      setHasMore(true);
      loadMessages(true);
    }
  }, [selectedContact?.id, initialLoadDone, loadMessages]);

  // Scroll to latest message after messages load
  useEffect(() => {
    if (
      selectedContact &&
      allMessages.get(getChatKey(selectedContact))?.length &&
      initialLoadDone
    ) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [allMessages, selectedContact, getChatKey, messagesEndRef, initialLoadDone]);

  // Handle scroll to top for loading older messages
  const handleScroll = debounce(() => {
    if (
      messagesContainerRef.current &&
      messagesContainerRef.current.scrollTop === 0 &&
      hasMore &&
      !isFetching
    ) {
      loadMessages(false);
    }
  }, 500);

  /**
   * Render individual chat message based on type
   */
  const renderMessage = (msg: IChatMessage) => {
    const isSent = msg.senderId === currentUserId;
    const baseClass = `p-3 mb-3 rounded-lg max-w-xs shadow-md transition-all duration-200 ${
      isSent
        ? "bg-blue-500 text-white self-end ml-auto"
        : "bg-gray-100 text-gray-800 self-start border border-gray-200"
    } ${msg.contentType !== "text" ? "p-0" : ""}`;

    const isGroupChat = selectedContact?.type === "group";
    const senderName = isSent ? "You" : selectedContact?.name;
    const senderPic = isSent ? currentUser?.profilePic : selectedContact?.profilePic;

    // Group chat with sender name and profile
    if (isGroupChat && !isSent) {
      return (
        <div className="flex items-start mb-3">
          <Avatar src={senderPic} size="sm" className="mr-2" />
          <div className={baseClass}>
            <p className="text-xs text-gray-500 mb-1">{senderName}</p>
            {msg.contentType === "text" && msg.content}
            {msg.contentType === "image" && (
              <img src={msg.content} alt="Sent image" className="max-w-full h-auto rounded-lg" />
            )}
            {msg.contentType === "video" && msg.thumbnailUrl && (
              <div className="relative w-48 h-48">
                <img src={msg.thumbnailUrl} alt="Video thumbnail" className="w-full h-full object-cover rounded-lg" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <button
                    onClick={() => window.open(msg.content, "_blank")}
                    className="bg-black bg-opacity-50 rounded-full p-3"
                  >
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8 5v10l7-5z" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
            {msg.contentType === "file" && msg.thumbnailUrl && (
              <a href={msg.content} target="_blank" rel="noopener noreferrer" className="block w-48">
                <div className="relative">
                  <img src={msg.thumbnailUrl} alt="File thumbnail" className="w-full h-32 object-cover rounded-lg" />
                  <div className="absolute bottom-0 w-full bg-black bg-opacity-75 text-white text-sm p-1 truncate">
                    {msg.fileMetadata?.fileName || "File"}
                  </div>
                </div>
              </a>
            )}
          </div>
        </div>
      );
    }

    // Regular (non-group) message
    return (
      <div className="flex items-start mb-3">
        {!isSent && <Avatar src={senderPic} size="sm" className="mr-2" />}
        <div className={baseClass}>
          {msg.contentType === "text" && msg.content}
          {msg.contentType === "image" && (
            <img src={msg.content} alt="Sent image" className="max-w-full h-auto rounded-lg" />
          )}
          {msg.contentType === "video" && msg.thumbnailUrl && (
            <div className="relative w-48 h-48">
              <img src={msg.thumbnailUrl} alt="Video thumbnail" className="w-full h-full object-cover rounded-lg" />
              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  onClick={() => window.open(msg.content, "_blank")}
                  className="bg-black bg-opacity-50 rounded-full p-3"
                >
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8 5v10l7-5z" />
                  </svg>
                </button>
              </div>
            </div>
          )}
          {msg.contentType === "file" && msg.thumbnailUrl && (
            <a href={msg.content} target="_blank" rel="noopener noreferrer" className="block w-48">
              <div className="relative">
                <img src={msg.thumbnailUrl} alt="File thumbnail" className="w-full h-32 object-cover rounded-lg" />
                <div className="absolute bottom-0 w-full bg-black bg-opacity-75 text-white text-sm p-1 truncate">
                  {msg.fileMetadata?.fileName || "File"}
                </div>
              </div>
            </a>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Render notifications at the top */}
      {notifications.length > 0 && (
        <div className="mb-4 p-2">
          {notifications.map((notification, index) => (
            <div
              key={index}
              className="p-2 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-lg cursor-pointer hover:bg-yellow-200 dark:hover:bg-yellow-800 transition-colors"
              onClick={() => {
                const contact = contacts.find((c) => c.id === notification.contactId && c.type === notification.type);
                if (contact) onNotificationClick(contact);
              }}
            >
              {notification.message} ({new Date(notification.timestamp).toLocaleTimeString()})
            </div>
          ))}
        </div>
      )}

      {/* Chat messages container */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto mb-4 p-4 flex flex-col bg-gray-50 dark:bg-gray-800 rounded-b-xl"
        onScroll={handleScroll}
      >
        {isFetching && (
          <p className="text-gray-500 dark:text-gray-400 text-center p-2">Loading more messages...</p>
        )}

        {/* Conditional rendering based on message availability */}
        {selectedContact && allMessages.get(getChatKey(selectedContact))?.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center">No messages yet</p>
        ) : selectedContact ? (
          allMessages
            .get(getChatKey(selectedContact))
            ?.map((msg) => <div key={`${msg._id}_${msg.timestamp}`}>{renderMessage(msg)}</div>) || (
            <p className="text-gray-500 dark:text-gray-400 text-center">Loading more messages...</p>
          )
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-center">Select a contact to view messages</p>
        )}

        {/* auto-scroll to latest */}
        <div ref={messagesEndRef} />
      </div>
    </>
  );
};

export default ChatMessages;
