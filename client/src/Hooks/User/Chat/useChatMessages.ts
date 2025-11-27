import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { debounce } from "lodash";
import { Contact } from "../../../Interface/User/Icontact";
import { IChatMessage } from "../../../Interface/User/IchatMessage";
import { fetchChatMessages } from "../../../Service/Chat.Service";
import {
  deduplicateMessages,
  getChatKey,
  getChatKeyFromMessage,
} from "../../../Components/User/Common/Chat/utils/contactUtils";
import { socketService } from "../../../Service/SocketService";

export const useChatMessages = (
  onMessageActivity?: (chatKey: string) => void
) => {
  const [allMessages, setAllMessages] = useState<Map<string, IChatMessage[]>>(
    new Map()
  );
  const [lastMessages, setLastMessages] = useState<
    Record<string, IChatMessage | null>
  >({});
  const [typingUsers, setTypingUsers] = useState<Record<string, string[]>>({});
  const typingTimeoutsRef = useRef<
    Record<string, ReturnType<typeof setTimeout>>
  >({});

  // FETCH MESSAGES (PAGINATION)
  const fetchMessages = useCallback(
    async (
      contact: Contact,
      page: number,
      signal?: AbortSignal
    ): Promise<{ messages: IChatMessage[]; total: number }> => {
      try {
        const res = await fetchChatMessages(
          contact.type !== "group" ? contact.contactId : undefined,
          contact.type === "group" ? contact.groupId : undefined,
          page,
          10,
          signal
        );

        console.log(
          "[useChatMessages] Fetched messages:",
          { page, contactId: contact.contactId, groupId: contact.groupId },
          res
        );

        return {
          messages: res?.messages ?? [],
          total: res?.total ?? 0,
        };
      } catch (error) {
        if (
          error?.name === "AbortError" ||
          error?.name === "CanceledError"
        ) {
          throw error;
        }

        console.error("Error fetching chat messages:", error);
        return { messages: [], total: 0 };
      }
    },
    []
  );

  // FETCH LAST MESSAGE FOR ALL CONTACTS
  const fetchLastMessagesForContacts = useCallback(
    async (contacts: Contact[]) => {
      try {
        const results: Record<string, IChatMessage | null> = {};

        for (const contact of contacts) {
          const chatKey = getChatKey(contact);

          const response = await fetchChatMessages(
            contact.type !== "group" ? contact.contactId : undefined,
            contact.type === "group" ? contact.groupId : undefined,
            1,
            1
          );

          results[chatKey] = response?.messages?.[0] || null;
        }

        setLastMessages(results);
      } catch (err) {
        console.error("Error fetching last messages:", err);
      }
    },
    []
  );

  // HANDLE INCOMING MESSAGE
  const handleIncomingMessage = useCallback(
    (message: IChatMessage) => {
      const chatKey = getChatKeyFromMessage(message);

      setAllMessages((prev) => {
        const current = prev.get(chatKey) || [];
        const updated = deduplicateMessages([...current, message]);

        return new Map(prev).set(chatKey, updated);
      });

      setLastMessages((prev) => ({
        ...prev,
        [chatKey]: message,
      }));

      // Notify notification hook
      if (onMessageActivity) onMessageActivity(chatKey);

      return chatKey;
    },
    [onMessageActivity]
  );

  //HANDLE MESSAGE SAVED (NO NOTIFICATION HERE)
  const handleMessageSaved = useCallback((message: IChatMessage) => {
    const chatKey = getChatKeyFromMessage(message);

    setAllMessages((prev) => {
      const current = prev.get(chatKey) || [];

      const exists = current.some((m) => m._id === message._id);

      const updated = exists
        ? current.map((m) =>
            m._id === message._id ? { ...m, ...message } : m
          )
        : [...current, message];

      return new Map(prev).set(chatKey, deduplicateMessages(updated));
    });

    setLastMessages((prev) => ({
      ...prev,
      [chatKey]: message,
    }));

    return chatKey;
  }, []);

  // HANDLE MESSAGES READ (SHOULD MARK NOTIFICATION AS READ)
  const handleMessagesRead = useCallback(
    (chatKey: string) => {
      setAllMessages((prev) => {
        const msgs = prev.get(chatKey) || [];

        const updated = msgs.map((m) =>
          !m.isRead
            ? {
                ...m,
                isRead: true,
                status: "read" as const,
              }
            : m
        );

        return new Map(prev).set(chatKey, updated);
      });

      // Notify notification hook
      if (onMessageActivity) onMessageActivity(chatKey);
    },
    [onMessageActivity]
  );

  // TYPING EVENTS — DEBOUNCED
  const sendTyping = useMemo(
    () =>
      debounce((chatKey: string, userId: string) => {
        socketService.socket?.emit("typing", { chatKey, userId });

        const key = `${chatKey}_${userId}`;

        if (typingTimeoutsRef.current[key]) {
          clearTimeout(typingTimeoutsRef.current[key]);
        }

        typingTimeoutsRef.current[key] = setTimeout(() => {
          socketService.socket?.emit("stopTyping", { chatKey, userId });
        }, 1200);
      }, 300),
    []
  );

  const forceStopTyping = useCallback((chatKey: string, userId: string) => {
    socketService.socket?.emit("stopTyping", { chatKey, userId });
  }, []);

  useEffect(() => {
  const timeoutsMap = typingTimeoutsRef.current;

  return () => {
    Object.values(timeoutsMap).forEach((t) => clearTimeout(t));
    sendTyping.cancel();
  };
}, [sendTyping]);

  // SOCKET LISTENERS — ALL MOVED HERE
  useEffect(() => {
    const onReceive = (msg: IChatMessage) => handleIncomingMessage(msg);
    const onSaved = (msg: IChatMessage) => handleMessageSaved(msg);
    const onRead = ({ chatKey }: { chatKey: string }) =>
      handleMessagesRead(chatKey);

    const onTyping = ({
      userId,
      chatKey,
    }: {
      userId: string;
      chatKey: string;
    }) => {
      setTypingUsers((prev) => ({
        ...prev,
        [chatKey]: [
          ...(prev[chatKey] || []).filter((id) => id !== userId),
          userId,
        ],
      }));
    };

    const onStopTyping = ({
      userId,
      chatKey,
    }: {
      userId: string;
      chatKey: string;
    }) => {
      setTypingUsers((prev) => ({
        ...prev,
        [chatKey]: (prev[chatKey] || []).filter((id) => id !== userId),
      }));
    };

    socketService.onReceiveMessage(onReceive);
    socketService.onMessageSaved(onSaved);
    socketService.onMessagesRead(onRead);
    socketService.onTyping(onTyping);
    socketService.onStopTyping(onStopTyping);

    return () => {
      socketService.socket?.off("receiveMessage", onReceive);
      socketService.socket?.off("messageSaved", onSaved);
      socketService.socket?.off("messagesRead", onRead);
      socketService.socket?.off("typing", onTyping);
      socketService.socket?.off("stopTyping", onStopTyping);
    };
  }, [handleIncomingMessage, handleMessageSaved, handleMessagesRead]);

  // RETURN HOOK API
  return {
    allMessages,
    setAllMessages,

    lastMessages,
    setLastMessages,

    typingUsers,
    sendTyping,
    forceStopTyping,

    fetchMessages,
    fetchLastMessagesForContacts,

    handleIncomingMessage,
    handleMessageSaved,
    handleMessagesRead,
  };
};
