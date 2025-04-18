import { Contact, IChatMessage } from "../../../../../types";
import MessageItem from "./MessageItem";
import { formatDate } from "./formatUtils";
import { useSelector } from "react-redux";
import { RootState } from "../../../../../redux/store";

// Props for the MessageGroup component
interface MessageGroupProps {
  date: string;
  messages: IChatMessage[];
  selectedContact: Contact | null;
  currentUserId?: string;
}

// Component to render messages grouped by date
const MessageGroup: React.FC<MessageGroupProps> = ({
  date,
  messages,
  selectedContact,
  currentUserId,
}) => {
  const { currentUser } = useSelector((state: RootState) => state.user);

  return (
    <div className="flex flex-col space-y-4">
      {/* Date header */}
      <div className="flex items-center justify-center my-4">
        <div className="bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full text-xs font-medium text-gray-600 dark:text-gray-300">
          {formatDate(date)}
        </div>
      </div>

      {/* Messages */}
      {messages.map((msg, idx) => {
        const previousMsg = idx > 0 ? messages[idx - 1] : null;
        const getMessageSender = (m: IChatMessage) => {
          if (m.senderId === currentUserId || m.senderId === currentUser?._id) {
            return { name: "You" };
          }
          if (selectedContact?.type === "group" && selectedContact.groupDetails?.members) {
            const member = selectedContact.groupDetails.members.find((mem) => mem._id === m.senderId);
            return { name: member?.name || selectedContact?.name || "Unknown" };
          }
          return { name: selectedContact?.name || "Unknown" };
        };
        const previousSender = previousMsg ? getMessageSender(previousMsg) : null;
        const currentSender = getMessageSender(msg);
        const showSender = !previousSender || previousSender.name !== currentSender.name;

        return (
          <MessageItem
            key={`${msg._id}_${msg.timestamp}`}
            message={msg}
            selectedContact={selectedContact}
            currentUserId={currentUserId || currentUser?._id}
            showSender={showSender}
          />
        );
      })}
    </div>
  );
};

export default MessageGroup;