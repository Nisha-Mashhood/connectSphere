import { useCallback, useRef, useState } from "react";

interface UseChatScrollOptions {
  bottomThreshold?: number;      // how close to bottom to consider "at bottom"
}

export const useChatScroll = (options?: UseChatScrollOptions) => {
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const [isAtBottom, setIsAtBottom] = useState(true);

  const bottomThreshold = options?.bottomThreshold ?? 80;

  // 🔹 Called on scroll: updates isAtBottom
  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;

    const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);

    // If we are close enough to bottom, treat as "at bottom"
    setIsAtBottom(distanceFromBottom <= bottomThreshold);
  }, [bottomThreshold]);

  // 🔹 Scroll to bottom (used when we WANT to jump to latest message)
  const scrollToBottom = useCallback(
    (behavior: ScrollBehavior = "smooth") => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior });
      }
    },
    []
  );

  return {
    messagesContainerRef,
    messagesEndRef,
    isAtBottom,
    handleScroll,
    scrollToBottom,
  };
};
