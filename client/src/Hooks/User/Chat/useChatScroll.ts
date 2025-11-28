import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { debounce } from "lodash";
import { Contact } from "../../../Interface/User/Icontact";
import { IChatMessage } from "../../../Interface/User/IchatMessage";

interface UseChatScrollParams {
  selectedContact: Contact | null;
  getChatKey: (c: Contact) => string;
  allMessages: Map<string, IChatMessage[]>;
  setAllMessages: React.Dispatch<
    React.SetStateAction<Map<string, IChatMessage[]>>
  >;
  fetchMessages: (
    contact: Contact,
    page: number,
    signal?: AbortSignal
  ) => Promise<{ messages: IChatMessage[]; total: number }>;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

export const useChatScroll = ({
  selectedContact,
  getChatKey,
  allMessages,
  setAllMessages,
  fetchMessages,
  messagesEndRef,
}: UseChatScrollParams) => {
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const [showScrollDown, setShowScrollDown] = useState(false);

  const isUserScrolling = useRef(false);
  const fetchAbortControllerRef = useRef<AbortController | null>(null);
  const blockResetRef = useRef(false);

  // 🔹 Refs for latest values (avoid stale closures)
  const pageRef = useRef(page);
  const hasMoreRef = useRef(hasMore);
  const isFetchingRef = useRef(isFetching);

  useEffect(() => {
    pageRef.current = page;
  }, [page]);

  useEffect(() => {
    hasMoreRef.current = hasMore;
  }, [hasMore]);

  useEffect(() => {
    isFetchingRef.current = isFetching;
  }, [isFetching]);

  // 🔹 Scroll to bottom (debounced & stable)
  const scrollToBottom = useMemo(
    () =>
      debounce(() => {
        const container = messagesContainerRef.current;
        const end = messagesEndRef.current;

        if (!container || !end) return;

        if (!isUserScrolling.current) {
          end.scrollIntoView({ behavior: "smooth" });
        }
      }, 200),
    [messagesEndRef]
  );

  useEffect(() => {
    return () => {
      scrollToBottom.cancel();
    };
  }, [scrollToBottom]);

  // LOAD MESSAGES (internal, safe, guarded)
  const loadMessages = useCallback(
    async (reset = false) => {
      if (!selectedContact) return;

      // already fetching → skip
      if (isFetchingRef.current) return;

      // no more pages and not reset → skip
      if (!reset && !hasMoreRef.current) return;

      const chatKey = getChatKey(selectedContact);
      const currentPage = reset ? 1 : pageRef.current;

      // abort previous fetch if any
      if (fetchAbortControllerRef.current) {
        fetchAbortControllerRef.current.abort();
      }

      const controller = new AbortController();
      fetchAbortControllerRef.current = controller;

      setIsFetching(true);
      isFetchingRef.current = true;

      try {
        const { messages: newMessages, total } = await fetchMessages(
          selectedContact,
          currentPage,
          controller.signal
        );

        setAllMessages((prev) => {
          const existing = prev.get(chatKey) || [];
          const updated = reset ? newMessages : [...newMessages, ...existing];

          updated.sort(
            (a, b) =>
              new Date(a.timestamp).getTime() -
              new Date(b.timestamp).getTime()
          );

          const next = new Map(prev);
          next.set(chatKey, updated);
          return next;
        });

        const nextHasMore =
          currentPage * 10 < total && newMessages.length > 0;
        setHasMore(nextHasMore);
        hasMoreRef.current = nextHasMore;

        const nextPage = currentPage + 1;
        setPage(nextPage);
        pageRef.current = nextPage;

        if (reset) {
          setInitialLoadDone(true);
        }
      } catch (err) {
        if (
          err?.name !== "AbortError" &&
          err?.name !== "CanceledError"
        ) {
          console.warn("Error loading messages:", err);
        }
      } finally {
        setIsFetching(false);
        isFetchingRef.current = false;
        fetchAbortControllerRef.current = null;
      }
    },
    [selectedContact, getChatKey, fetchMessages, setAllMessages]
  );

  // On Contact Change → Reset & Load First Page
  useEffect(() => {
    if (!selectedContact) return;

    if (!blockResetRef.current) {
      setInitialLoadDone(false);
      setPage(1);
      pageRef.current = 1;
      setHasMore(true);
      hasMoreRef.current = true;
      loadMessages(true);
    }

    blockResetRef.current = false;
  }, [selectedContact, loadMessages]);

  // Auto Scroll after initial load / new messages
  useEffect(() => {
    if (!selectedContact) return;
    if (!initialLoadDone) return;

    const chatKey = getChatKey(selectedContact);
    const msgs = allMessages.get(chatKey) || [];

    if (msgs.length === 0) return;

    if (!isUserScrolling.current) {
      scrollToBottom();
    }
  }, [
    allMessages,
    selectedContact,
    initialLoadDone,
    getChatKey,
    scrollToBottom,
  ]);

  // Scroll listener (infinite scroll at top)
  const handleScroll = useMemo(
    () =>
      debounce(() => {
        const container = messagesContainerRef.current;
        if (!container) return;

        const { scrollTop, scrollHeight, clientHeight } = container;

        const nearTop = scrollTop < 50;
        const nearBottom = scrollHeight - scrollTop - clientHeight < 200;

        isUserScrolling.current = !nearBottom;

        setShowScrollDown(!nearBottom);

        if (nearTop) {
          // load previous page (if available)
          loadMessages(false);
        }
      }, 150),
    [loadMessages]
  );

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    container.addEventListener("scroll", handleScroll);

    return () => {
      container.removeEventListener("scroll", handleScroll);
      handleScroll.cancel();
    };
  }, [handleScroll]);

  // Abort on unmount
  useEffect(() => {
    return () => {
      if (fetchAbortControllerRef.current) {
        fetchAbortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    messagesContainerRef,
    isFetching,
    hasMore,
    page,
    initialLoadDone,
    showScrollDown,
    scrollToBottom,
  };
};
