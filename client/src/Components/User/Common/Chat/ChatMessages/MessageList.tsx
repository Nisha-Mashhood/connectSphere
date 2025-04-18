import { Contact, IChatMessage } from "../../../../../types";
import { Spinner } from "@nextui-org/react";
import MessageGroup from "./MessageGroup";
import EmptyState from "./EmptyState";
import { getMessagesByDate } from "./formatUtils";

// Props for the MessageList component
interface MessageListProps {
  selectedContact: Contact | null;
  allMessages: Map<string, IChatMessage[]>;
  getChatKey: (contact: Contact) => string;
  currentUserId?: string;
  isFetching: boolean;
  messagesContainerRef: React.RefObject<HTMLDivElement>;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

// Component to render the scrollable message list
const MessageList: React.FC<MessageListProps> = ({
  selectedContact,
  allMessages,
  getChatKey,
  currentUserId,
  isFetching,
  messagesContainerRef,
  messagesEndRef,
}) => {
  const messages = selectedContact ? allMessages.get(getChatKey(selectedContact)) : [];
  const messagesByDate = getMessagesByDate(messages);

  return (
    <div
      ref={messagesContainerRef}
      className="flex-1 overflow-y-auto mb-4 flex flex-col p-2 sm:p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent min-h-0"
    >
      {/* Loading indicator */}
      {isFetching && (
        <div className="flex justify-center p-3" aria-live="polite">
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full shadow-sm">
            <Spinner size="sm" color="primary" />
            <span className="text-sm text-gray-600 dark:text-gray-300">Loading messages...</span>
          </div>
        </div>
      )}

      {/* Empty state or messages */}
      {!selectedContact || messages?.length === 0 ? (
        <EmptyState selectedContact={selectedContact} />
      ) : (
        messagesByDate.map((dateGroup, groupIndex) => (
          <MessageGroup
            key={groupIndex}
            date={dateGroup.date}
            messages={dateGroup.messages}
            selectedContact={selectedContact}
            currentUserId={currentUserId}
          />
        ))
      )}

      {/* Anchor for scrolling to bottom */}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;