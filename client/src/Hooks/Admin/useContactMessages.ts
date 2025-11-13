import { useState, useCallback, useEffect } from "react";
import { toast } from "react-hot-toast";
import { getContactMessages, sendReply } from "../../Service/ContactUs.Service";
import { ContactMessage } from "../../Interface/Admin/IContactMessage";

export const useContactMessages = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState<"all" | "today" | "7days" | "30days">("all");

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);

  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true);

      const response = await getContactMessages({
        page,
        limit,
        search: searchQuery,
        dateFilter,
      });

      setMessages(response.messages || []);
      setTotal(response.total || 0);
    } catch (error) {
      toast.error("Failed to fetch messages");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [page, limit, searchQuery, dateFilter]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const sendMessageReply = async (msg: ContactMessage, replyText: string) => {
    try {
      await sendReply(msg.id, {
        email: msg.email,
        replyMessage: replyText,
      });

      toast.success("Reply sent!");
      setMessages((prev) =>
        prev.map((m) =>
          m.contactMessageId === msg.contactMessageId
            ? { ...m, givenReply: true }
            : m
        )
      );
    } catch (error) {
        console.log(error)
      toast.error("Failed to send reply");
    }
  };

  return {
    messages,
    loading,
    searchQuery,
    setSearchQuery,
    dateFilter,
    setDateFilter,
    page,
    setPage,
    limit,
    total,
    sendMessageReply,
  };
};
