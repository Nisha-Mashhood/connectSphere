import React, { useEffect, useRef, useCallback, useState, useMemo } from "react";
import { debounce } from "lodash";
import { Contact, IChatMessage } from "../../../../../types";
import { fetchChatMessages } from "../../../../../Service/Chat.Service";
import { Avatar, Spinner } from "@nextui-org/react";
import { useSelector } from "react-redux";
import { RootState } from "../../../../../redux/store";
import { MessageSquare, FileText, Video, ChevronDown, Download } from "lucide-react";
import "./ChatMessages.css";
import { socketService } from "../../../../../Service/SocketService";

interface ChatMessagesProps {
  selectedContact: Contact | null;
  allMessages: Map<string, IChatMessage[]>;
  setAllMessages: React.Dispatch<React.SetStateAction<Map<string, IChatMessage[]>>>;
  getChatKey: (contact: Contact) => string;
  currentUserId?: string;
  onNotificationClick: (contact: Contact) => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

const ChatMessages: React.FC<ChatMessagesProps> = ({
  selectedContact,
  allMessages,
  setAllMessages,
  getChatKey,
  currentUserId,
  messagesEndRef,
}) => {
  const { currentUser } = useSelector((state: RootState) => state.user);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const [showScrollDown, setShowScrollDown] = useState(false);
  const [isContainerScrollable, setIsContainerScrollable] = useState(false);
  const isUserScrolling = useRef(false);
  const fetchAbortControllerRef = useRef<AbortController | null>(null);

  const fetchMessages = useMemo(
    () => async (
      contact: Contact,
      page: number,
      signal: AbortSignal
    ): Promise<{ messages: IChatMessage[]; total: number }> => {
      try {
        const response = await fetchChatMessages(
          contact.type !== "group" ? contact.contactId : undefined,
          contact.type === "group" ? contact.groupId : undefined,
          page,
          10,
          signal
        );
        console.log("Messages fetched:", response.messages);
        return response;
      } catch (error) {
        if (error.name !== "CanceledError") {
          console.warn("Fetching Messages Cancelled Error:", error);
        } else {
          throw error;
        }
      }
    },
    []
  );

  const loadMessages = useCallback(
    async (resetPage = false) => {
      if (!selectedContact || isFetching || (!hasMore && !resetPage)) return;

      const chatKey = getChatKey(selectedContact);
      const container = messagesContainerRef.current;
      const previousScrollHeight = container?.scrollHeight || 0;
      const currentPage = resetPage ? 1 : page;

      // Abort any previous fetch
      if (fetchAbortControllerRef.current) {
        fetchAbortControllerRef.current.abort();
      }

      // Create new AbortController
      const controller = new AbortController();
      fetchAbortControllerRef.current = controller;

      setIsFetching(true);
      try {
        const { messages: newMessages, total } = await fetchMessages(
          selectedContact,
          currentPage,
          controller.signal
        );

        setAllMessages((prev) => {
          const currentMessages = prev.get(chatKey) || [];
          const updatedMessages = resetPage
            ? newMessages
            : [...newMessages, ...currentMessages];
          return new Map(prev).set(chatKey, updatedMessages);
        });

        setHasMore(currentPage * 10 < total && newMessages.length > 0);
        setPage(currentPage + 1);
        if (resetPage) setInitialLoadDone(true);

        // Mark messages as read
        if (newMessages.length > 0 && currentUser?._id) {
          socketService.markAsRead(chatKey, currentUser._id, selectedContact.type);
        }

        if (!resetPage && container && isContainerScrollable) {
          requestAnimationFrame(() => {
            const newScrollHeight = container.scrollHeight;
            container.scrollTop = newScrollHeight - previousScrollHeight;
          });
        }
      } catch (error) {
        if (error.name !== "CanceledError") {
          console.warn("Fetching Messages Cancelled Error:", error);
        }
      } finally {
        setIsFetching(false);
        fetchAbortControllerRef.current = null;
      }
    },
    [selectedContact, page, isFetching, hasMore, getChatKey, setAllMessages, isContainerScrollable, currentUser?._id, fetchMessages]
  );

  const scrollToBottom = useCallback(
    debounce(() => {
      if (messagesContainerRef.current && messagesEndRef.current && !isUserScrolling.current) {
        const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 200;
        console.log("Scroll check:", { scrollTop, scrollHeight, clientHeight, isNearBottom });
        if (isNearBottom) {
          messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
      }
    }, 200),
    []
  );

  useEffect(() => {
    if (selectedContact) {
      setInitialLoadDone(false);
      setPage(1);
      setHasMore(true);
    }
  }, [selectedContact]);

  useEffect(() => {
    if (selectedContact && !initialLoadDone) {
      loadMessages(true);
    }
  }, [selectedContact, initialLoadDone, loadMessages]);

  useEffect(() => {
    if (
      selectedContact &&
      allMessages.get(getChatKey(selectedContact))?.length &&
      initialLoadDone &&
      !isUserScrolling.current
    ) {
      console.log("Triggering scrollToBottom for chatKey:", getChatKey(selectedContact));
      scrollToBottom();
    }
  }, [selectedContact, getChatKey, initialLoadDone, scrollToBottom, allMessages]);

  useEffect(() => {
    const checkScrollable = () => {
      const container = messagesContainerRef.current;
      if (container) {
        const isScrollable = container.scrollHeight > container.clientHeight;
        setIsContainerScrollable(isScrollable);
      }
    };

    checkScrollable();
    window.addEventListener("resize", checkScrollable);
    return () => window.removeEventListener("resize", checkScrollable);
  }, [allMessages]);

  useEffect(() => {
    if (!selectedContact) return;

    const chatKey = getChatKey(selectedContact);

    const handleReceiveMessage = (message: IChatMessage) => {
      console.log("Received receiveMessage:", JSON.stringify(message, null, 2));
      if (!message._id || !message.senderId || !message.contentType || !message.timestamp) {
        console.warn("Invalid message in receiveMessage:", message);
        return;
      }
      if (message.groupId && !selectedContact.groupId) {
        console.warn("Group message received but no groupId in selectedContact:", message);
        return;
      }

      let inferredChatType: "group" | "user-mentor" | "user-user" | null = null;
      if (message.groupId) {
        inferredChatType = "group";
      } else if (message.collaborationId) {
        inferredChatType = "user-mentor";
      } else if (message.userConnectionId) {
        inferredChatType = "user-user";
      }

      const isMatchingChat =
        inferredChatType === selectedContact.type &&
        ((inferredChatType === "group" && message.groupId === selectedContact.groupId) ||
         (inferredChatType === "user-mentor" && message.collaborationId === selectedContact.collaborationId) ||
         (inferredChatType === "user-user" && message.userConnectionId === selectedContact.userConnectionId));

      if (isMatchingChat && message._id) {
        setAllMessages((prev) => {
          const currentMessages = prev.get(chatKey) || [];
          const messageExists = currentMessages.some((m) => m._id === message._id);
          if (!messageExists) {
            console.log("Adding new message to allMessages (receiveMessage):", message._id);
            return new Map(prev).set(chatKey, [...currentMessages, message]);
          }
          console.log("Updating existing message status (receiveMessage):", message._id);
          return new Map(prev).set(
            chatKey,
            currentMessages.map((m) => (m._id === message._id ? { ...m, status: message.status, isRead: message.isRead || false } : m))
          );
        });
        scrollToBottom();
      } else {
        console.warn("Message does not match selected chat (receiveMessage):", {
          message,
          selectedContact,
        });
      }
    };

    const handleMessageSaved = (message: IChatMessage) => {
      console.log("Received messageSaved:", JSON.stringify(message, null, 2));
      if (!message._id || !message.senderId || !message.contentType || !message.timestamp) {
        console.warn("Invalid message in messageSaved:", message);
        return;
      }
      if (message.groupId && !selectedContact.groupId) {
        console.warn("Group message received but no groupId in selectedContact:", message);
        return;
      }

      let inferredChatType: "group" | "user-mentor" | "user-user" | null = null;
      if (message.groupId) {
        inferredChatType = "group";
      } else if (message.collaborationId) {
        inferredChatType = "user-mentor";
      } else if (message.userConnectionId) {
        inferredChatType = "user-user";
      }

      const isMatchingChat =
        inferredChatType === selectedContact.type &&
        ((inferredChatType === "group" && message.groupId === selectedContact.groupId) ||
         (inferredChatType === "user-mentor" && message.collaborationId === selectedContact.collaborationId) ||
         (inferredChatType === "user-user" && message.userConnectionId === selectedContact.userConnectionId));

      if (isMatchingChat && message._id) {
        setAllMessages((prev) => {
          const currentMessages = prev.get(chatKey) || [];
          const messageExists = currentMessages.some((m) => m._id === message._id);
          if (!messageExists) {
            console.log("Adding new message to allMessages (messageSaved):", message._id);
            return new Map(prev).set(chatKey, [...currentMessages, message]);
          }
          console.log("Updating existing message status (messageSaved):", message._id);
          return new Map(prev).set(
            chatKey,
            currentMessages.map((m) => (m._id === message._id ? { ...m, status: message.status, isRead: message.isRead || false } : m))
          );
        });
        scrollToBottom();
      } else {
        console.warn("Message does not match selected chat (messageSaved):", {
          message,
          selectedContact,
        });
      }
    };

    const debouncedHandleMessagesRead = debounce((data: { chatKey: string; userId: string; messageIds: string[] }) => {
      console.log("Received messagesRead event:", JSON.stringify(data, null, 2));
      if (data.chatKey === chatKey) {
        if (!Array.isArray(data.messageIds) || !data.messageIds.length) {
          console.warn("Invalid or missing messageIds in messagesRead event:", data.messageIds);
          return;
        }
        setAllMessages((prev) => {
          const currentMessages = prev.get(chatKey) || [];
          if (!currentMessages.length) {
            console.log("No messages yet for chatKey, skipping messagesRead:", chatKey);
            return prev;
          }
          return new Map(prev).set(
            chatKey,
            currentMessages.map((msg) =>
              data.messageIds.includes(msg._id) ? { ...msg, status: "read", isRead: true } : msg
            )
          );
        });
      }
    }, 200); // Reduced debounce delay for faster status updates

    socketService.onReceiveMessage(handleReceiveMessage);
    socketService.onMessageSaved(handleMessageSaved);
    socketService.onMessagesRead(debouncedHandleMessagesRead);

    return () => {
      socketService.socket?.off("receiveMessage", handleReceiveMessage);
      socketService.socket?.off("messageSaved", handleMessageSaved);
      socketService.socket?.off("messagesRead", debouncedHandleMessagesRead);

      if (fetchAbortControllerRef.current) {
        fetchAbortControllerRef.current.abort();
        fetchAbortControllerRef.current = null;
      }
    };
  }, [selectedContact, getChatKey, setAllMessages, scrollToBottom]);

  const handleScroll = useCallback(
    debounce(() => {
      const container = messagesContainerRef.current;
      if (isContainerScrollable && container) {
        const { scrollTop, scrollHeight, clientHeight } = container;
        const isNearTop = scrollTop < 50;
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 200;
        isUserScrolling.current = scrollTop > 0 && !isNearBottom;

        if (isNearTop && hasMore && !isFetching) {
          loadMessages(false);
        }

        setShowScrollDown(!isNearBottom);
      }
    }, 200),
    [hasMore, isFetching, loadMessages, isContainerScrollable]
  );

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (isContainerScrollable && container) {
      container.addEventListener("scroll", handleScroll);
      container.addEventListener("touchmove", handleScroll);
      return () => {
        container.removeEventListener("scroll", handleScroll);
        container.removeEventListener("touchmove", handleScroll);
      };
    }
    return () => {};
  }, [handleScroll, isContainerScrollable]);

  const formatTime = (timestamp: string | Date) => {
    const date = typeof timestamp === "string" ? new Date(timestamp) : timestamp;
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      console.warn("Invalid timestamp:", timestamp);
      return "Invalid time";
    }
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (timestamp: string | Date) => {
    const date = typeof timestamp === "string" ? new Date(timestamp) : timestamp;
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      console.warn("Invalid date:", timestamp);
      return "Unknown date";
    }
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString(undefined, {
        weekday: "long",
        month: "short",
        day: "numeric",
      });
    }
  };

  const getMessagesByDate = (messages: IChatMessage[] | undefined) => {
    if (!messages) return [];

    const messagesByDate: { date: string; messages: IChatMessage[] }[] = [];
    let currentDate = "";

    messages.forEach((message) => {
      const messageDate = new Date(message.timestamp).toDateString();
      if (messageDate !== currentDate) {
        currentDate = messageDate;
        messagesByDate.push({
          date: new Date(message.timestamp).toISOString(),
          messages: [message],
        });
      } else {
        messagesByDate[messagesByDate.length - 1].messages.push(message);
      }
    });

    return messagesByDate;
  };

  const getMessageSender = (msg: IChatMessage) => {
    if (!msg.senderId) {
      return { name: "Unknown", profilePic: undefined, isSelf: false };
    }
    if (msg.senderId === currentUserId) {
      return {
        name: "You",
        profilePic: currentUser?.profilePic,
        isSelf: true,
      };
    }
    if (selectedContact?.type === "group" && selectedContact.groupDetails?.members) {
      const member = selectedContact.groupDetails.members.find(
        (m) => m.userId === msg.senderId
      );
      if (member) {
        return {
          name: member.name || "Unknown",
          profilePic: member.profilePic,
          isSelf: false,
        };
      }
      return { name: "Unknown User", profilePic: undefined, isSelf: false };
    }
    return {
      name: selectedContact?.name || "Unknown",
      profilePic: selectedContact?.profilePic,
      isSelf: false,
    };
  };

  const renderMessageContent = (msg: IChatMessage, showSender = false, isLastMessage = false) => {
  const sender = getMessageSender(msg);
  const isSent = sender.isSelf;

  const renderStatusText = () => {
    if (!isSent || !isLastMessage) return null;
    return (
      <span className="text-xs text-blue-500 ml-1 capitalize">
        {msg.status === "read" ? "read" : msg.status === "sent" ? "sent" : "waiting..."}
      </span>
    );
  }

  return (
      <div className={`flex items-end gap-2 mb-1 ${isSent ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        {!isSent && (
          <div className="flex-shrink-0">
            {showSender ? (
              <Avatar
                src={sender.profilePic}
                size="sm"
                className="w-8 h-8"
                showFallback
                fallback={
                  <div className="w-full h-full flex items-center justify-center bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300 text-xs font-medium">
                    {sender.name.charAt(0).toUpperCase()}
                  </div>
                }
              />
            ) : (
              <div className="w-8 h-8" />
            )}
          </div>
        )}

        {/* Message Content */}
        <div className={`flex flex-col max-w-xs sm:max-w-sm md:max-w-md ${isSent ? 'items-end' : 'items-start'}`}>
          {/* Sender name for group chats */}
          {!isSent && showSender && selectedContact?.type === "group" && (
            <span className="text-xs text-gray-500 dark:text-gray-400 mb-1 px-3">
              {sender.name}
            </span>
          )}

          {/* Message bubble */}
          <div className={`
            relative px-3 py-2 rounded-2xl max-w-full break-words text-sm
            ${isSent 
              ? 'bg-blue-500 text-white rounded-br-md' 
              : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-md'
            }
          `}>
            {msg.contentType === "text" && (
              <div>
                <p className="leading-relaxed">{msg.content}</p>
              </div>
            )}

            {msg.contentType === "image" && (
              <div className="space-y-2">
                <div className="rounded-lg overflow-hidden max-w-xs">
                  <img
                    src={msg.content}
                    alt="Sent image"
                    className="w-full h-auto object-cover"
                    loading="lazy"
                  />
                </div>
                {msg.caption && (
                  <p className="leading-relaxed">{msg.caption}</p>
                )}
              </div>
            )}

            {msg.contentType === "video" && msg.thumbnailUrl && (
              <div className="space-y-2">
                <div className="relative rounded-lg overflow-hidden max-w-xs">
                  <img
                    src={msg.thumbnailUrl}
                    alt="Video thumbnail"
                    className="w-full h-32 object-cover"
                  />
                  <button
                    onClick={() => window.open(msg.content, "_blank")}
                    className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 hover:bg-opacity-50 transition-all"
                    aria-label="Play video"
                  >
                    <div className="w-12 h-12 bg-white bg-opacity-90 rounded-full flex items-center justify-center">
                      <Video size={20} className="text-gray-800 ml-1" />
                    </div>
                  </button>
                </div>
                {msg.caption && (
                  <p className="leading-relaxed">{msg.caption}</p>
                )}
              </div>
            )}

            {msg.contentType === "file" && (
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-3 bg-white bg-opacity-10 rounded-lg min-w-0">
                  <div className="flex-shrink-0">
                    <FileText size={20} className={isSent ? "text-white" : "text-gray-600 dark:text-gray-400"} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${isSent ? "text-white" : "text-gray-900 dark:text-gray-100"}`}>
                      {msg.fileMetadata?.fileName || "File"}
                    </p>
                    {msg.fileMetadata?.fileSize && (
                      <p className={`text-xs ${isSent ? "text-blue-100" : "text-gray-500 dark:text-gray-400"}`}>
                        {(msg.fileMetadata.fileSize / 1024).toFixed(1)} KB
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => window.open(msg.content, "_blank")}
                    className={`flex-shrink-0 p-1 rounded ${isSent ? "hover:bg-white hover:bg-opacity-20" : "hover:bg-gray-200 dark:hover:bg-gray-600"}`}
                    aria-label="Download file"
                  >
                    <Download size={16} className={isSent ? "text-white" : "text-gray-600 dark:text-gray-400"} />
                  </button>
                </div>
                {msg.caption && (
                  <p className="leading-relaxed">{msg.caption}</p>
                )}
              </div>
            )}
          </div>

          {/* Time and status */}
          <div className={`flex items-center gap-1 mt-1 px-1 ${isSent ? 'flex-row-reverse' : 'flex-row'}`}>
            <span className="text-xs text-gray-400 dark:text-gray-500">
              {formatTime(msg.timestamp)}
            </span>
            {isSent && renderStatusText()}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col flex-grow relative overflow-hidden h-full">
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto mb-4 flex flex-col p-2 sm:p-3 space-y-3 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent min-h-0"
      >
        {isFetching && (
          <div className="flex justify-center p-2" aria-live="polite">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-full shadow-sm">
              <Spinner size="sm" color="primary" />
              <span className="text-xs text-gray-600 dark:text-gray-300">Loading messages...</span>
            </div>
          </div>
        )}

        {selectedContact && allMessages.get(getChatKey(selectedContact))?.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
              <MessageSquare size={18} className="text-gray-400 dark:text-gray-500" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-center text-xs sm:text-sm">
              No messages yet
            </p>
            <p className="text-gray-400 dark:text-gray-500 text-xs text-center mt-1">
              Send a message to start the conversation
            </p>
          </div>
        ) : !selectedContact ? (
          <div className="flex-1 flex flex-col items-center justify-center px-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mb-3">
              <MessageSquare size={18} className="text-blue-500 dark:text-blue-400" />
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-center text-xs sm:text-sm">
              Select a contact to start chatting
            </p>
          </div>
        ) : (
          getMessagesByDate(allMessages.get(getChatKey(selectedContact)))?.map(
            (dateGroup, groupIndex) => (
              <div key={groupIndex} className="flex flex-col space-y-3">
                <div className="flex items-center justify-center my-3">
                  <div className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full text-xs font-medium text-gray-600 dark:text-gray-300">
                    {formatDate(dateGroup.date)}
                  </div>
                </div>

                {dateGroup.messages.map((msg, idx) => {
                  const sender = getMessageSender(msg);
                  const previousMsg = idx > 0 ? dateGroup.messages[idx - 1] : null;
                  const previousSender = previousMsg ? getMessageSender(previousMsg) : null;
                  const showSender = !previousSender || previousSender.name !== sender.name;
                  const isLastMessage = idx === dateGroup.messages.length - 1 ||
                    (idx < dateGroup.messages.length - 1 &&
                      getMessageSender(dateGroup.messages[idx + 1]).name !== sender.name);

                  return (
                    <div key={`${msg._id}_${msg.timestamp}`} className="animate-fade-in-up">
                      {renderMessageContent(msg, showSender, isLastMessage)}
                    </div>
                  );
                })}
              </div>
            )
          )
        )}
        <div ref={messagesEndRef} />
      </div>

      {showScrollDown && (
        <button
          className="absolute bottom-3 right-3 p-1.5 bg-gray-100 dark:bg-gray-800 rounded-full shadow-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-all transform hover:scale-105"
          onClick={() => {
            isUserScrolling.current = false;
            scrollToBottom();
          }}
          aria-label="Scroll to bottom"
        >
          <ChevronDown size={14} className="text-gray-600 dark:text-gray-300" />
        </button>
      )}
    </div>
  );
};

export default ChatMessages;