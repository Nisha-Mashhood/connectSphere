import React, { useEffect, useRef, useCallback, useState } from "react";
import { debounce } from "lodash";
import { Contact, IChatMessage, Notification } from "../../../../types";
import { fetchChatMessages } from "../../../../Service/Chat.Service";
import { Avatar } from "@nextui-org/react";
import { useSelector } from "react-redux";
import { RootState } from "../../../../redux/store";

interface ChatMessagesProps {
  selectedContact: Contact | null;
  allMessages: Map<string, IChatMessage[]>;
  getChatKey: (contact: Contact) => string;
  currentUserId?: string;
  notifications: Notification[];
  onNotificationClick: (contact: Contact) => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

const ChatMessages: React.FC<ChatMessagesProps> = ({
  selectedContact,
  allMessages,
  getChatKey,
  currentUserId,
  notifications,
  onNotificationClick,
  messagesEndRef,
}) => {
  const { currentUser } = useSelector((state: RootState) => state.user);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  const loadMessages = useCallback(
    async (resetPage = false) => {
      if (!selectedContact || isFetching || (!hasMore && !resetPage)) return;

      const chatKey = getChatKey(selectedContact);
      const container = messagesContainerRef.current;
      const previousScrollHeight = container?.scrollHeight || 0;

      console.log("loadMessages called:", { resetPage, page, selectedContactId: selectedContact.id });

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

  useEffect(() => {
    if (selectedContact && !initialLoadDone) {
      setPage(1);
      setHasMore(true);
      loadMessages(true);
    }
  }, [selectedContact?.id, initialLoadDone, loadMessages]);

  useEffect(() => {
    if (selectedContact && allMessages.get(getChatKey(selectedContact))?.length && initialLoadDone) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [allMessages, selectedContact, getChatKey, messagesEndRef, initialLoadDone]);

  const handleScroll = debounce(() => {
    if (
      messagesContainerRef.current &&
      messagesContainerRef.current.scrollTop === 0 &&
      hasMore &&
      !isFetching
    ) {
      console.log("Scroll triggered loadMessages");
      loadMessages(false);
    }
  }, 500);

  const renderMessage = (msg: IChatMessage) => {
    const isSent = msg.senderId === currentUserId;
    const baseClass = `p-2 mb-2 rounded max-w-xs ${
      isSent ? "bg-green-500 text-black self-end ml-auto" : "bg-white text-black self-start border"
    }`;
    const isGroupChat = selectedContact?.type === "group";
    const senderName = isSent ? "You" : selectedContact?.name;
    const senderPic = isSent ? currentUser?.profilePic : selectedContact?.profilePic;

    if (isGroupChat && !isSent) {
      return (
        <div className="flex items-start mb-2">
          <div>
            <div className={baseClass}>
              {msg.contentType === "text" && msg.content}
              {msg.contentType === "image" && (
                <img src={msg.content} alt="Sent image" className="max-w-full h-auto" />
              )}
              {msg.contentType === "video" && (
                <video src={msg.content} controls className="max-w-full h-auto" />
              )}
              {msg.contentType === "file" && (
                <a href={msg.content} target="_blank" rel="noopener noreferrer">
                  {msg.fileMetadata?.fileName || "Download File"}
                </a>
              )}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-start mb-2">
        {!isSent && <Avatar src={senderPic} size="sm" className="mr-2" />}
        <div className={baseClass}>
          {!isSent && <p className="text-sm text-gray-600">{senderName}</p>}
          {msg.contentType === "text" && msg.content}
          {msg.contentType === "image" && <img src={msg.content} alt="Sent image" />}
          {msg.contentType === "video" && <video src={msg.content} controls className="max-w-full h-auto" />}
          {msg.contentType === "file" && (
            <a href={msg.content} target="_blank" rel="noopener noreferrer">
              {msg.fileMetadata?.fileName || "Download File"}
            </a>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {notifications.length > 0 && (
        <div className="mb-4">
          {notifications.map((notification, index) => (
            <div
              key={index}
              className="p-2 bg-yellow-100 text-black rounded cursor-pointer"
              onClick={() => {
                const contact = null; 
                if (contact) onNotificationClick(contact);
              }}
            >
              {notification.message} ({new Date(notification.timestamp).toLocaleTimeString()})
            </div>
          ))}
        </div>
      )}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto mb-4 flex flex-col"
        onScroll={handleScroll}
      >
        {isFetching && (
          <p className="text-gray-500 text-center p-2">Loading more messages...</p>
        )}
        {selectedContact && allMessages.get(getChatKey(selectedContact))?.length === 0 ? (
          <p className="text-gray-500 text-center">No messages yet</p>
        ) : selectedContact ? (
          allMessages
            .get(getChatKey(selectedContact))
            ?.map((msg) => <div key={`${msg._id}_${msg.timestamp}`}>{renderMessage(msg)}</div>) || (
            <p className="text-gray-500 text-center">Loading more messages...</p>
          )
        ) : (
          <p className="text-gray-500 text-center">Select a contact to view messages</p>
        )}
        <div ref={messagesEndRef} />
      </div>
    </>
  );
};

export default ChatMessages;