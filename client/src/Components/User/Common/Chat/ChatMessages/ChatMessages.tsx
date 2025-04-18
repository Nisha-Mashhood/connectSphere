import React, { useEffect, useRef, useCallback, useState } from "react";
import { debounce } from "lodash";
import { Contact, IChatMessage, Notification } from "../../../../../types";
import { fetchChatMessages } from "../../../../../Service/Chat.Service";
import { Avatar, Spinner, Tooltip } from "@nextui-org/react";
import { useSelector } from "react-redux";
import { RootState } from "../../../../../redux/store";
import { MessageSquare, FileText, Video, AlertTriangle, ChevronDown, Clock, Check, CheckCheck } from "lucide-react";
import "./ChatMessages.css";

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
  const [showScrollDown, setShowScrollDown] = useState(false);
  const [isContainerScrollable, setIsContainerScrollable] = useState(false);

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
    [selectedContact, page, isFetching, hasMore, allMessages, getChatKey, isContainerScrollable]
  );

  // Reset state when selectedContact changes
  useEffect(() => {
    if (selectedContact) {
      setInitialLoadDone(false);
      setPage(1);
      setHasMore(true);
    }
  }, [selectedContact?.id]);

  // Load messages when selectedContact changes or initial load is not done
  useEffect(() => {
    if (selectedContact && !initialLoadDone) {
      loadMessages(true);
    }
  }, [selectedContact?.id, initialLoadDone, loadMessages]);

  useEffect(() => {
    if (
      selectedContact &&
      allMessages.get(getChatKey(selectedContact))?.length &&
      initialLoadDone
    ) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [allMessages, selectedContact, getChatKey, messagesEndRef, initialLoadDone]);

  // Check if the messages container is scrollable
  useEffect(() => {
    const checkScrollable = () => {
      const container = messagesContainerRef.current;
      if (container) {
        const isScrollable = container.scrollHeight > container.clientHeight;
        setIsContainerScrollable(isScrollable);
        console.log("Is container scrollable:", isScrollable, {
          scrollHeight: container.scrollHeight,
          clientHeight: container.clientHeight,
        });
      }
    };

    checkScrollable();
    window.addEventListener("resize", checkScrollable);
    return () => window.removeEventListener("resize", checkScrollable);
  }, [allMessages]);

  const handleScroll = useCallback(
    debounce(() => {
      const container = messagesContainerRef.current;
      // const target = event.target as HTMLElement;

      if (isContainerScrollable && container) {
        const { scrollTop, scrollHeight, clientHeight } = container;
        const isNearTop = scrollTop < 50;
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;

        console.log("Container scroll:", {
          scrollTop,
          scrollHeight,
          clientHeight,
          isNearTop,
          isFetching,
          hasMore,
        });

        if (isNearTop && hasMore && !isFetching) {
          loadMessages(false);
        }

        setShowScrollDown(!isNearBottom);
      } else {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight;
        const clientHeight = window.innerHeight;
        const isNearTop = scrollTop < 50;
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;

        console.log("Window scroll:", {
          scrollTop,
          scrollHeight,
          clientHeight,
          isNearTop,
          isFetching,
          hasMore,
        });

        if (isNearTop && hasMore && !isFetching) {
          loadMessages(false);
        }

        setShowScrollDown(!isNearBottom);
      }
    }, 100),
    [hasMore, isFetching, loadMessages, isContainerScrollable]
  );

  useEffect(() => {
    const container = messagesContainerRef.current;
    const addListeners = (target: Window | HTMLElement, isWindow: boolean) => {
      if (isWindow) {
        window.addEventListener("scroll", handleScroll);
        window.addEventListener("touchmove", handleScroll);
      } else if (target instanceof HTMLElement) {
        target.addEventListener("scroll", handleScroll);
        target.addEventListener("touchmove", handleScroll);
      }
    };

    const removeListeners = (target: Window | HTMLElement, isWindow: boolean) => {
      if (isWindow) {
        window.removeEventListener("scroll", handleScroll);
        window.removeEventListener("touchmove", handleScroll);
      } else if (target instanceof HTMLElement) {
        target.removeEventListener("scroll", handleScroll);
        target.removeEventListener("touchmove", handleScroll);
      }
    };

    if (isContainerScrollable && container) {
      addListeners(container, false);
      return () => removeListeners(container, false);
    } else {
      addListeners(window, true);
      return () => removeListeners(window, true);
    }
  }, [handleScroll, isContainerScrollable]);

  const scrollToBottom = () => {
    if (isContainerScrollable && messagesContainerRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    } else {
      window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" });
    }
  };

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
    if (msg.senderId === currentUserId) {
      return {
        name: "You",
        profilePic: currentUser?.profilePic,
        isSelf: true,
      };
    }

    if (selectedContact?.type === "group" && selectedContact.groupDetails?.members) {
      const member = selectedContact.groupDetails.members.find((m) => m._id === msg.senderId || m.userId === msg.senderId);
      if (member) {
        return {
          name: member.name,
          profilePic: member.profilePic,
          isSelf: false,
        };
      }
    }

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

      const renderStatusIcon = () => {
        if (!isSent) return null;
        if (msg.status === "pending") {
          return <Clock size={12} className="text-blue-200 ml-1" />;
        } else if (msg.status === "sent") {
          return <Check size={12} className="text-blue-200 ml-1" />;
        } else {
          return <CheckCheck size={12} className="text-blue-100 ml-1" />;
        }
      };

    const timeBadge = (
      <span
        className={`text-xs ${isSent ? "text-blue-100" : "text-gray-500 dark:text-gray-400"} opacity-80`}
      >
        {formatTime(msg.timestamp)}
        {renderStatusIcon()}
      </span>
    );

    return (
      <div
        className={`flex ${isSent ? "flex-row-reverse" : "flex-row"} items-start gap-2 w-full max-w-[85%] sm:max-w-[70%] md:max-w-[60%] mx-auto sm:mx-0 ${
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

  const renderNotifications = () => {
    if (!selectedContact || notifications.length === 0) return null;

    const contactNotifications = notifications.filter(
      (notif) => notif.contactId === selectedContact.id && notif.type === selectedContact.type
    );

    if (contactNotifications.length === 0) return null;

    return contactNotifications.map((notification, index) => (
      <div
        key={index}
        className="m-2 p-2 sm:p-3 bg-gradient-to-r from-amber-100 to-yellow-100 dark:from-amber-900 dark:to-yellow-900 text-amber-800 dark:text-amber-200 rounded-lg shadow-md border border-amber-200 dark:border-amber-700 cursor-pointer transform transition-transform hover:scale-102 animate-fade-in"
        onClick={() => onNotificationClick(selectedContact)}
      >
        <div className="flex items-center gap-2">
          <AlertTriangle size={14} className="text-amber-600 dark:text-amber-400" />
          <div className="flex-1">
            <div className="font-medium text-sm sm:text-base">{notification.message}</div>
            <div className="text-xs text-amber-700 dark:text-amber-300">
              {formatTime(notification.timestamp)}
            </div>
          </div>
        </div>
      </div>
    ));
  };

  return (
    <div className="flex flex-col flex-grow relative overflow-hidden h-full">
      <div className="absolute top-0 left-0 right-0 z-10">{renderNotifications()}</div>

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
          onClick={scrollToBottom}
          aria-label="Scroll to bottom"
        >
          <ChevronDown size={16} className="text-gray-600 dark:text-gray-300" />
        </button>
      )}
    </div>
  );
};

export default ChatMessages;