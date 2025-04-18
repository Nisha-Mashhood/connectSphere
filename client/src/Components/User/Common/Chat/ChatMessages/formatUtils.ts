import { IChatMessage } from "../../../../../types";

// Formats a timestamp into a time string 
export const formatTime = (timestamp: string | Date): string => {
  const date = typeof timestamp === "string" ? new Date(timestamp) : timestamp;
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    console.warn("Invalid timestamp:", timestamp);
    return "Invalid time";
  }
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

// Formats a timestamp into a date label 
export const formatDate = (timestamp: string | Date): string => {
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

// Groups messages by date for display
export const getMessagesByDate = (messages: IChatMessage[] | undefined) => {
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