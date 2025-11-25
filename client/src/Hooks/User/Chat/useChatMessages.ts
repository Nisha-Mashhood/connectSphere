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
  onMessageActivity?: (chatKey: string) => void   // ⬅ NEW CALLBACK
) => {

  // 🔹 All messages grouped by chatKey
  const [allMessages, setAllMessages] = useState<Map<string, IChatMessage[]>>(
    new Map()
  );

  // 🔹 Last message for each chatKey
  const [lastMessages, setLastMessages] = useState<
    Record<string, IChatMessage | null>
  >({});

  // 🔹 Typing users → { chatKey: ["user1", "user2"] }
  const [typingUsers, setTypingUsers] = useState<Record<string, string[]>>({});

  // 🔹 Timeout map to auto-stop typing
  const typingTimeoutsRef = useRef<Record<string, number>>({});

  // ---------------------------------------------------------------------------
  // 1️⃣ CHAT KEY BUILDER
  // ---------------------------------------------------------------------------


  // ---------------------------------------------------------------------------
  // 2️⃣ FETCH MESSAGES (PAGINATION)
  // ---------------------------------------------------------------------------

  const fetchMessages = useCallback(
    async (
      contact: Contact,
      page: number,
      signal?: AbortSignal
    ): Promise<{ messages: IChatMessage[]; total: number }> => {
      try {
        return await fetchChatMessages(
          contact.type !== "group" ? contact.contactId : undefined,
          contact.type === "group" ? contact.groupId : undefined,
          page,
          10,
          signal
        );
      } catch (error) {
        if (error?.name !== "CanceledError") {
          console.error("Error fetching messages:", error);
        }
        throw error;
      }
    },
    []
  );

  // ---------------------------------------------------------------------------
  // 3️⃣ FETCH LAST MESSAGE FOR ALL CONTACTS
  // ---------------------------------------------------------------------------

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

          results[chatKey] = response.messages[0] || null;
        }

        setLastMessages(results);
      } catch (err) {
        console.error("Error fetching last messages:", err);
      }
    },
    []
  );

  // ---------------------------------------------------------------------------
  // 4️⃣ HANDLE INCOMING MESSAGE
  // ---------------------------------------------------------------------------

  const handleIncomingMessage = useCallback(
    (message: IChatMessage) => {
      const chatKey = getChatKeyFromMessage(message);

      setAllMessages((prev) => {
        const current = prev.get(chatKey) || [];
        const updated = deduplicateMessages([...current, message]);

        return new Map(prev).set(chatKey, updated);
      });

      // update last message
      setLastMessages((prev) => ({
        ...prev,
        [chatKey]: message,
      }));

      // 🔔 Notify notification hook
      if (onMessageActivity) onMessageActivity(chatKey);

      return chatKey;
    },
    [onMessageActivity]
  );

  // ---------------------------------------------------------------------------
  // 5️⃣ HANDLE MESSAGE SAVED (NO NOTIFICATION HERE)
  // ---------------------------------------------------------------------------

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

  // ---------------------------------------------------------------------------
  // 6️⃣ HANDLE MESSAGES READ (SHOULD MARK NOTIFICATION AS READ)
  // ---------------------------------------------------------------------------

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

      // 🔔 Notify notification hook
      if (onMessageActivity) onMessageActivity(chatKey);
    },
    [onMessageActivity]
  );

  // ---------------------------------------------------------------------------
  // 7️⃣ TYPING EVENTS — DEBOUNCED
  // ---------------------------------------------------------------------------

  const sendTyping = useMemo(
    () =>
      debounce((chatKey: string, userId: string) => {
        socketService.socket?.emit("typing", { chatKey, userId });

        if (typingTimeoutsRef.current[chatKey]) {
          clearTimeout(typingTimeoutsRef.current[chatKey]);
        }

        typingTimeoutsRef.current[chatKey] = setTimeout(() => {
          socketService.socket?.emit("stopTyping", { chatKey, userId });
        }, 1200);
      }, 300),
    []
  );

  const forceStopTyping = useCallback((chatKey: string, userId: string) => {
    socketService.socket?.emit("stopTyping", { chatKey, userId });
  }, []);

  // ---------------------------------------------------------------------------
  // 8️⃣ SOCKET LISTENERS — ALL MOVED HERE
  // ---------------------------------------------------------------------------

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
  }, [
    handleIncomingMessage,
    handleMessageSaved,
    handleMessagesRead,
  ]);

  // ---------------------------------------------------------------------------
  // RETURN HOOK API
  // ---------------------------------------------------------------------------

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
