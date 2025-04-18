import { useState, useEffect, useCallback, useRef } from "react";
import { debounce } from "lodash";
import { Contact, IChatMessage } from "../../../../../types";
import { fetchChatMessages } from "../../../../../Service/Chat.Service";

// Interface for the return value
interface UseMessagesReturn {
  isFetching: boolean;
  page: number;
  hasMore: boolean;
  initialLoadDone: boolean;
  showScrollDown: boolean;
  isContainerScrollable: boolean;
  messagesContainerRef: React.RefObject<HTMLDivElement>;
  loadMessages: (resetPage?: boolean) => Promise<void>;
  handleScroll: () => void;
  scrollToBottom: () => void;
}

interface UseMessagesProps {
  selectedContact: Contact | null;
  allMessages: Map<string, IChatMessage[]>;
  getChatKey: (contact: Contact) => string;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

// Custom hook to manage message fetching, scrolling, and state
export const useMessages = ({
  selectedContact,
  allMessages,
  getChatKey,
  messagesEndRef,
}: UseMessagesProps): UseMessagesReturn => {
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const [showScrollDown, setShowScrollDown] = useState(false);
  const [isContainerScrollable, setIsContainerScrollable] = useState(false);

  // Fetches messages for the selected contact
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

        // Maintain scroll position after loading new messages
        if (!resetPage && container && isContainerScrollable) {
          requestAnimationFrame(() => {
            const newScrollHeight = container.scrollHeight;
            container.scrollTop = newScrollHeight - previousScrollHeight;
            console.log("Adjusted scrollTop:", container.scrollTop, {
              newScrollHeight,
              previousScrollHeight,
            });
          });
        }
      } catch (error) {
        console.error("Error loading messages:", error);
      } finally {
        setIsFetching(false); 
      }
    },
    [selectedContact, page, isFetching, hasMore, allMessages, getChatKey, isContainerScrollable]
  );

  // Load messages on contact change
  useEffect(() => {
    if (selectedContact && !initialLoadDone) {
      setPage(1);
      setHasMore(true);
      loadMessages(true);
    }
  }, [selectedContact?.id, initialLoadDone, loadMessages]);

  // Scroll to bottom after new messages
  useEffect(() => {
    if (
      selectedContact &&
      allMessages.get(getChatKey(selectedContact))?.length &&
      initialLoadDone
    ) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      console.log("Scrolled to bottom after new messages");
    }
  }, [allMessages, selectedContact, getChatKey, messagesEndRef, initialLoadDone]);

  // Check if the container is scrollable
  useEffect(() => {
    const checkScrollable = () => {
      const container = messagesContainerRef.current;
      if (container) {
        requestAnimationFrame(() => {
          const isScrollable = container.scrollHeight > container.clientHeight;
          setIsContainerScrollable(isScrollable);
          console.log("Is container scrollable:", isScrollable, {
            scrollHeight: container.scrollHeight,
            clientHeight: container.clientHeight,
            messagesLength: allMessages.get(getChatKey(selectedContact))?.length || 0,
          });
        });
      }
    };

    checkScrollable();
    window.addEventListener("resize", checkScrollable);
    return () => window.removeEventListener("resize", checkScrollable);
  }, [allMessages, selectedContact, getChatKey]);

  // Handle scroll events for infinite loading
  const handleScroll = useCallback(
    debounce(() => {
      const container = messagesContainerRef.current;

      if (isContainerScrollable && container) {
        // Container scroll for larger windows
        const { scrollTop, scrollHeight, clientHeight } = container;
        const isNearTop = scrollTop < 50;
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;

        console.log("Container scroll:", {
          scrollTop,
          scrollHeight,
          clientHeight,
          isNearTop,
          isNearBottom,
          isFetching,
          hasMore,
        });

        if (isNearTop && hasMore && !isFetching) {
          loadMessages(false);
        }

        setShowScrollDown(!isNearBottom);
      } else {
        // Window scroll for smaller windows
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
          isNearBottom,
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

  // Add/remove scroll event listeners
  useEffect(() => {
    const container = messagesContainerRef.current;

    const addListeners = (target: Window | HTMLElement, isWindow: boolean) => {
      const events = ["scroll", "touchmove"];
      events.forEach((event) => {
        if (isWindow) {
          window.addEventListener(event, handleScroll as EventListener);
        } else if (target instanceof HTMLElement) {
          target.addEventListener(event, handleScroll as EventListener);
        }
      });
      console.log(`Added ${isWindow ? "window" : "container"} scroll listeners`);
    };

    const removeListeners = (target: Window | HTMLElement, isWindow: boolean) => {
      const events = ["scroll", "touchmove"];
      events.forEach((event) => {
        if (isWindow) {
          window.removeEventListener(event, handleScroll as EventListener);
        } else if (target instanceof HTMLElement) {
          target.removeEventListener(event, handleScroll as EventListener);
        }
      });
      console.log(`Removed ${isWindow ? "window" : "container"} scroll listeners`);
    };

    if (isContainerScrollable && container) {
      addListeners(container, false);
      return () => removeListeners(container, false);
    } else {
      addListeners(window, true);
      return () => removeListeners(window, true);
    }
  }, [handleScroll, isContainerScrollable]);

  // Scroll to the bottom of messages
  const scrollToBottom = useCallback(() => {
    if (isContainerScrollable && messagesContainerRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      console.log("Scrolled to bottom (container)");
    } else {
      window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" });
      console.log("Scrolled to bottom (window)");
    }
  }, [isContainerScrollable, messagesEndRef]);

  return {
    isFetching,
    page,
    hasMore,
    initialLoadDone,
    showScrollDown,
    isContainerScrollable,
    messagesContainerRef,
    loadMessages,
    handleScroll,
    scrollToBottom,
  };
};
