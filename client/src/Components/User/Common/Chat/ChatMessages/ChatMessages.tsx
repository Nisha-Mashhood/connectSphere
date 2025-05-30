import React, { useEffect, useRef, useCallback, useState } from "react";
import { debounce } from "lodash";
import { Contact, IChatMessage } from "../../../../../types";
import { fetchChatMessages } from "../../../../../Service/Chat.Service";
import { Avatar, Spinner, Tooltip } from "@nextui-org/react";
import { useSelector } from "react-redux";
import { RootState } from "../../../../../redux/store";
import { MessageSquare, FileText, Video, ChevronDown } from "lucide-react";
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

        if (!resetPage && container && isContainerScrollable) {
          requestAnimationFrame(() => {
            const newScrollHeight = container.scrollHeight;
            container.scrollTop = newScrollHeight - previousScrollHeight;
          });
        }
      } catch (error) {
        console.error("Error loading messages:", error);
      } finally {
        setTimeout(() => setIsFetching(false), 100);
      }
    },
    [selectedContact, page, isFetching, hasMore, getChatKey, setAllMessages, isContainerScrollable]
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
  }, [selectedContact?.id]);

  useEffect(() => {
    if (selectedContact && !initialLoadDone) {
      loadMessages(true);
    }
  }, [selectedContact?.id, initialLoadDone, loadMessages]);

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
  }, [selectedContact, getChatKey, initialLoadDone, scrollToBottom]);

  useEffect(() => {
    const checkScrollable = () => {
      const container = messagesContainerRef.current;
      if (container) {
        const isScrollable = container.scrollHeight > container.clientHeight;
        setIsContainerScrollable(isScrollable);
        // console.log("Is container scrollable:", isScrollable, {
        //   scrollHeight: container.scrollHeight,
        //   clientHeight: container.clientHeight,
        // });
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
      if (!message._id || !message.senderId || !message.contentType || !message.timestamp ) {
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
        if (!Array.isArray(data.messageIds) || !data.messageIds) {
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
    }, 500);

    socketService.onReceiveMessage(handleReceiveMessage);
    socketService.onMessageSaved(handleMessageSaved);
    socketService.onMessagesRead(debouncedHandleMessagesRead);

    return () => {
      socketService.socket?.off("receiveMessage", handleReceiveMessage);
      socketService.socket?.off("messageSaved", handleMessageSaved);
      socketService.socket?.off("messagesRead", debouncedHandleMessagesRead);
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

        // console.log("Container scroll:", {
        //   scrollTop,
        //   scrollHeight,
        //   clientHeight,
        //   isNearTop,
        //   isFetching,
        //   hasMore,
        //   isUserScrolling: isUserScrolling.current,
        // });

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
    // console.warn("Message missing senderId:", msg);
    return { name: "Unknown", profilePic: undefined, isSelf: false };
  }
  // console.log("Processing message with senderId:", msg.senderId);
  if (msg.senderId === currentUserId) {
    // console.log("Sender is current user:", currentUserId);
    return {
      name: "You",
      profilePic: currentUser?.profilePic,
      isSelf: true,
    };
  }
  if (selectedContact?.type === "group" && selectedContact.groupDetails?.members) {
    // console.log("Group members for contact:", JSON.stringify(selectedContact.groupDetails.members, null, 2));
    // console.log("Looking for senderId:", msg.senderId);
    const member = selectedContact.groupDetails.members.find(
      (m) => m.userId === msg.senderId
    );
    if (member) {
      // console.log("Found member:", JSON.stringify(member, null, 2));
      return {
        name: member.name || "Unknown",
        profilePic: member.profilePic,
        isSelf: false,
      };
    }
    // console.warn("No member found for senderId:", msg.senderId);
    return { name: "Unknown User", profilePic: undefined, isSelf: false };
  }
  // console.log("Falling back to contact details:", {
  //   name: selectedContact?.name,
  //   profilePic: selectedContact?.profilePic,
  // });
  return {
    name: selectedContact?.name || "Unknown",
    profilePic: selectedContact?.profilePic,
    isSelf: false,
  };
};

  const renderMessageContent = (msg: IChatMessage, showSender = false) => {
    const sender = getMessageSender(msg);
    const isSent = sender.isSelf;

    const bubbleClass = isSent
      ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl rounded-tr-none"
      : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-2xl rounded-tl-none";

      const renderStatusText = () => {
        if (!isSent) return null;
        return <span className="text-xs text-blue-200 ml-1 capitalize">{msg.status}</span>;
      };

      const timeBadge = (
        <span
          className={`text-xs ${isSent ? "text-blue-100" : "text-gray-500 dark:text-gray-400"} opacity-80`}
        >
          {formatTime(msg.timestamp)}
          {renderStatusText()}
        </span>
      );

      return (
        <div
          className={`flex ${isSent ? "flex-row-reverse" : "flex-row"} items-start gap-2 w-full max-w-[85%] sm:max-w-[70%] md:max-w-[60%] ${
            isSent ? "ml-auto" : "mr-auto"
          }`}
        >
          {!isSent && showSender && (
            <Tooltip content={sender.name} placement="left">
              <Avatar
                src={sender.profilePic}
                size="sm"
                className="mt-1 w-8 h-8 sm:w-10 sm:h-10"
                showFallback
                fallback={
                  <div className="w-full h-full flex items-center justify-center bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs sm:text-sm font-medium">
                    {sender.name.charAt(0).toUpperCase()}
                  </div>
                }
              />
            </Tooltip>
          )}
          {isSent && <div className="w-8 sm:w-10" />}
    
          <div className={`flex flex-col ${isSent ? "items-end" : "items-start"} w-full`}>
            {!isSent && showSender && (
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400 ml-1 mb-1">
                {sender.name}
              </span>
            )}
    
            <div className={`p-2 sm:p-3 ${bubbleClass} shadow-sm w-full max-w-full`}>
              {msg.contentType === "text" && (
                <div className="flex flex-col gap-1">
                  <span className="break-words text-sm sm:text-base">{msg.content}</span>
                  <div
                    className={`text-right ${isSent ? "text-blue-100" : "text-gray-500"} opacity-80 text-xs`}
                  >
                    {timeBadge}
                  </div>
                </div>
              )}
              {msg.contentType === "image" && (
                <div className="flex flex-col gap-1">
                  <div className="rounded-lg overflow-hidden">
                    <img
                      src={msg.content}
                      alt="Sent image"
                      className="w-full h-auto max-w-[12rem] sm:max-w-[16rem] object-cover"
                    />
                  </div>
                  {msg.caption && (
                    <span className="break-words text-sm sm:text-base mt-1">{msg.caption}</span>
                  )}
                  <div
                    className={`text-right ${isSent ? "text-blue-100" : "text-gray-500"} opacity-80 text-xs`}
                  >
                    {timeBadge}
                  </div>
                </div>
              )}
              {msg.contentType === "video" && msg.thumbnailUrl && (
                <div className="flex flex-col gap-1">
                  <div className="relative w-full max-w-[12rem] sm:max-w-[16rem] h-24 sm:h-36 rounded-lg overflow-hidden">
                    <img
                      src={msg.thumbnailUrl}
                      alt="Video thumbnail"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <button
                        onClick={() => window.open(msg.content, "_blank")}
                        className="bg-black bg-opacity-60 rounded-full p-2 sm:p-3 transform transition-transform hover:scale-110"
                        aria-label="Play video"
                      >
                        <Video size={20} className="text-white" />
                      </button>
                    </div>
                  </div>
                  {msg.caption && (
                    <span className="break-words text-sm sm:text-base mt-1">{msg.caption}</span>
                  )}
                  <div
                    className={`text-right ${isSent ? "text-blue-100" : "text-gray-500"} opacity-80 text-xs`}
                  >
                    {timeBadge}
                  </div>
                </div>
              )}
              {msg.contentType === "file" && (
                <div className="flex flex-col gap-1">
                  {msg.thumbnailUrl ? (
                    <a
                      href={msg.content}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full max-w-[12rem] sm:max-w-[16rem]"
                    >
                      <div className="relative rounded-lg overflow-hidden">
                        <img
                          src={msg.thumbnailUrl}
                          alt="File thumbnail"
                          className="w-full h-20 sm:h-24 object-cover"
                        />
                        <div className="absolute bottom-0 w-full bg-black bg-opacity-75 text-white text-xs p-2">
                          <div className="flex items-center gap-2">
                            <FileText size={14} />
                            <span className="truncate">{msg.fileMetadata?.fileName || "File"}</span>
                          </div>
                        </div>
                      </div>
                    </a>
                  ) : (
                    <a
                      href={msg.content}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center gap-2 py-2 px-3 rounded-lg w-full max-w-[12rem] sm:max-w-[16rem] ${
                        isSent
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white"
                      }`}
                    >
                      <FileText size={16} />
                      <span className="truncate text-sm">{msg.fileMetadata?.fileName || "File"}</span>
                    </a>
                  )}
                  {msg.caption && (
                    <span className="break-words text-sm sm:text-base mt-1">{msg.caption}</span>
                  )}
                  <div
                    className={`text-right ${isSent ? "text-blue-100" : "text-gray-500"} opacity-80 text-xs`}
                  >
                    {timeBadge}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      );
  };


  return (
    <div className="flex flex-col flex-grow relative overflow-hidden h-full">
      {/* <div className="absolute top-0 left-0 right-0 z-10">{renderNotifications()}</div> */}

      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto mb-4 flex flex-col p-2 sm:p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent min-h-0"
      >
        {isFetching && (
          <div className="flex justify-center p-3" aria-live="polite">
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full shadow-sm">
              <Spinner size="sm" color="primary" />
              <span className="text-sm text-gray-600 dark:text-gray-300">Loading messages...</span>
            </div>
          </div>
        )}

        {selectedContact && allMessages.get(getChatKey(selectedContact))?.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
              <MessageSquare size={20} className="text-gray-400 dark:text-gray-500" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-center text-sm sm:text-base">
              No messages yet
            </p>
            <p className="text-gray-400 dark:text-gray-500 text-xs sm:text-sm text-center mt-1">
              Send a message to start the conversation
            </p>
          </div>
        ) : !selectedContact ? (
          <div className="flex-1 flex flex-col items-center justify-center px-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mb-4">
              <MessageSquare size={20} className="text-blue-500 dark:text-blue-400" />
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-center text-sm sm:text-base">
              Select a contact to start chatting
            </p>
          </div>
        ) : (
          getMessagesByDate(allMessages.get(getChatKey(selectedContact)))?.map(
            (dateGroup, groupIndex) => (
              <div key={groupIndex} className="flex flex-col space-y-4">
                <div className="flex items-center justify-center my-4">
                  <div className="bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full text-xs font-medium text-gray-600 dark:text-gray-300">
                    {formatDate(dateGroup.date)}
                  </div>
                </div>

                {dateGroup.messages.map((msg, idx) => {
                  const sender = getMessageSender(msg);
                  const previousMsg = idx > 0 ? dateGroup.messages[idx - 1] : null;
                  const previousSender = previousMsg ? getMessageSender(previousMsg) : null;
                  const showSender = !previousSender || previousSender.name !== sender.name;

                  return (
                    <div key={`${msg._id}_${msg.timestamp}`} className="animate-fade-in-up">
                      {renderMessageContent(msg, showSender)}
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
          className="absolute bottom-4 right-4 p-2 bg-gray-100 dark:bg-gray-800 rounded-full shadow-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-all transform hover:scale-105"
          onClick={() => {
            isUserScrolling.current = false;
            scrollToBottom();
          }}
          aria-label="Scroll to bottom"
        >
          <ChevronDown size={16} className="text-gray-600 dark:text-gray-300" />
        </button>
      )}
    </div>
  );
};

export default ChatMessages;