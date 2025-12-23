import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Contact } from "../../../Interface/User/Icontact";
import { IChatMessage } from "../../../Interface/User/IchatMessage";
import { getChatKey as buildChatKey } from "../../../Components/User/Common/Chat/utils/contactUtils";
import { useChatScroll } from "./useChatScroll";

interface UseChatMessagesViewParams {
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

export const useChatMessagesView = ({
  selectedContact,
  currentUserId,
  allMessages,
  setAllMessages,
  fetchMessages,
}: UseChatMessagesViewParams) => {
  const {
    messagesContainerRef,
    messagesEndRef,
    isAtBottom,
    handleScroll,
    scrollToBottom,
  } = useChatScroll();

  const [isLoading, setIsLoading] = useState(false);
  const [unreadWhileAway, setUnreadWhileAway] = useState(0);
  const lastMessageCountRef = useRef<number>(0);
  const lastLatestTimestampRef = useRef<number | null>(null);

  const [pageByChatKey, setPageByChatKey] = useState<Record<string, number>>(
    {}
  );
  const [hasMoreByChatKey, setHasMoreByChatKey] = useState<
    Record<string, boolean>
  >({});
  const [isFetchingOlder, setIsFetchingOlder] = useState(false);

  const getChatKey = useMemo(() => (c: Contact) => buildChatKey(c), []);

  // Reset unread count when user comes back to bottom
  useEffect(() => {
    if (isAtBottom) {
      setUnreadWhileAway(0);
    }
  }, [isAtBottom]);

  // INITIAL LOAD — only when contact changes
  useEffect(() => {
    if (!selectedContact) return;

    const controller = new AbortController();
    const chatKey = getChatKey(selectedContact);

    setIsLoading(true);

    fetchMessages(selectedContact, 1, controller.signal)
      .then(({ messages, total }) => {
        setAllMessages((prev) => {
          const updated = new Map(prev);
          const sorted = [...messages].sort(
            (a, b) =>
              new Date(a.timestamp).getTime() -
              new Date(b.timestamp).getTime()
          );
          updated.set(chatKey, sorted);
          return updated;
        });

        // pagination state for this chat
        setPageByChatKey((prev) => ({
          ...prev,
          [chatKey]: 1,
        }));

        const hasMore = total ? messages.length < total : false;
        setHasMoreByChatKey((prev) => ({
          ...prev,
          [chatKey]: hasMore,
        }));
      })
      .catch((err) => {
        if (err?.name !== "AbortError") {
          console.error("Error fetching messages:", err);
        }
      })
      .finally(() => {
        setIsLoading(false);
      });

    return () => {
      controller.abort();
    };
  }, [selectedContact, fetchMessages, getChatKey, setAllMessages]);

  // HANDLE NEW / OLDER MESSAGES + UNREAD COUNT
  useEffect(() => {
    if (!selectedContact) {
      lastMessageCountRef.current = 0;
      lastLatestTimestampRef.current = null;
      setUnreadWhileAway(0);
      return;
    }

    const chatKey = getChatKey(selectedContact);
    const msgs = allMessages.get(chatKey) || [];

    const newCount = msgs.length;
    const prevCount = lastMessageCountRef.current;

    // No messages → reset
    if (newCount === 0) {
      lastMessageCountRef.current = 0;
      lastLatestTimestampRef.current = null;
      setUnreadWhileAway(0);
      return;
    }

    const latestMsg = msgs[msgs.length - 1];
    const latestTs = new Date(latestMsg.timestamp).getTime();
    const prevLatestTs = lastLatestTimestampRef.current;

    // Count decreased (chat changed / reset)
    if (newCount < prevCount) {
      lastMessageCountRef.current = newCount;
      lastLatestTimestampRef.current = latestTs;
      if (isAtBottom) {
        scrollToBottom("auto");
      }
      return;
    }

    // Only older messages loaded (top history): latest message unchanged
    if (prevLatestTs !== null && latestTs === prevLatestTs) {
      lastMessageCountRef.current = newCount;
      return;
    }

    // Real new messages arrived
  if (newCount > prevCount) {
    const newMessages = msgs.slice(prevCount);

    // Count messages from others
    const newFromOthers = newMessages.filter(
      (m) => m.senderId && m.senderId !== currentUserId
    );

    // Count messages from self (current user)
    const newFromSelf = newMessages.filter(
      (m) => m.senderId === currentUserId
    );

    // Always scroll to bottom if current user sent a message
    if (newFromSelf.length > 0) {
      setTimeout(() => {
        scrollToBottom("smooth");
      }, 100);
      setUnreadWhileAway(0);
    } else if (newFromOthers.length > 0 && !isAtBottom) {
      setUnreadWhileAway((prev) => prev + newFromOthers.length);
    }
    else if (isAtBottom) {
      setTimeout(() => {
        scrollToBottom("auto");
      }, 50);
    }
  }

    lastMessageCountRef.current = newCount;
    lastLatestTimestampRef.current = latestTs;
  }, [
    allMessages,
    selectedContact,
    getChatKey,
    isAtBottom,
    scrollToBottom,
    currentUserId,
  ]);

  // LOAD OLDER MESSAGES WHEN SCROLLED TO TOP
  const loadOlderMessages = useCallback(async () => {
    if (!selectedContact) return;

    const chatKey = getChatKey(selectedContact);
    const currentPage = pageByChatKey[chatKey] ?? 1;
    const hasMore = hasMoreByChatKey[chatKey];

    if (isFetchingOlder) return;
    if (hasMore === false) return;

    setIsFetchingOlder(true);

    const container = messagesContainerRef.current;
    const prevScrollTop = container?.scrollTop ?? 0;
    const prevScrollHeight = container?.scrollHeight ?? 0;

    try {
      // small delay so the spinner is visible
      await new Promise((resolve) => setTimeout(resolve, 120));

      const nextPage = currentPage + 1;

      const { messages, total } = await fetchMessages(
        selectedContact,
        nextPage,
        undefined
      );

      if (!messages || messages.length === 0) {
        setHasMoreByChatKey((prev) => ({
          ...prev,
          [chatKey]: false,
        }));
        return;
      }

      setAllMessages((prev) => {
        const existing = prev.get(chatKey) || [];
        const combined = [...messages, ...existing];

        combined.sort(
          (a, b) =>
            new Date(a.timestamp).getTime() -
            new Date(b.timestamp).getTime()
        );

        const updated = new Map(prev);
        updated.set(chatKey, combined);
        return updated;
      });

      setPageByChatKey((prev) => ({
        ...prev,
        [chatKey]: nextPage,
      }));

      if (typeof total === "number" && total > 0) {
        const loadedCount = currentPage * 10 + messages.length; // 10 = page size
        const hasMoreNow = loadedCount < total;
        setHasMoreByChatKey((prev) => ({
          ...prev,
          [chatKey]: hasMoreNow,
        }));
      }

      if (container) {
        requestAnimationFrame(() => {
          const newScrollHeight = container.scrollHeight;
          const heightDiff = newScrollHeight - prevScrollHeight;
          container.scrollTop = prevScrollTop + heightDiff;
        });
      }
    } catch (err) {
      console.error("Error loading older messages:", err);
    } finally {
      setIsFetchingOlder(false);
    }
  }, [
    selectedContact,
    getChatKey,
    pageByChatKey,
    hasMoreByChatKey,
    isFetchingOlder,
    fetchMessages,
    messagesContainerRef,
    setAllMessages,
  ]);

  // SCROLL HANDLER (top detection + bottom state)
  const handleContainerScroll = useCallback(() => {
    handleScroll();

    const container = messagesContainerRef.current;
    if (!container) return;

    const topThreshold = 40;
    if (container.scrollTop <= topThreshold) {
      loadOlderMessages();
    }
  }, [handleScroll, messagesContainerRef, loadOlderMessages]);

  // GROUP MESSAGES BY DATE
  const groupMessagesByDate = useCallback((messages?: IChatMessage[]) => {
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
  }, []);

  const groupedMessages = useMemo(() => {
    if (!selectedContact) return [];
    const chatKey = getChatKey(selectedContact);
    return groupMessagesByDate(allMessages.get(chatKey));
  }, [allMessages, selectedContact, getChatKey, groupMessagesByDate]);

  // SENDER INFO
  const getMessageSender = useCallback(
    (msg: IChatMessage) => {
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
    },
    [currentUserId, selectedContact]
  );

  // FORMATTERS
  const formatTime = useCallback((ts: string | Date) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }, []);

  const formatDate = useCallback((ts: string | Date) => {
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
  }, []);

  return {
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
  };
};