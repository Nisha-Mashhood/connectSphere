import MessageBubble from "./MessageBubble";
import { IChatMessage } from "../../../../../Interface/User/IchatMessage";
import { Contact } from "../../../../../Interface/User/Icontact";

interface MessageListProps {
  groupedMessages: { date: string; messages: IChatMessage[] }[];
  selectedContact: Contact | null;
  getMessageSender: (msg: IChatMessage) => {
    name: string;
    profilePic?: string;
    isSelf: boolean;
  };
  formatDate: (d: string | Date) => string;
  formatTime: (d: string | Date) => string;
}

const MessageList: React.FC<MessageListProps> = ({
  groupedMessages,
  selectedContact,
  getMessageSender,
  formatDate,
  formatTime,
}) => {
  return groupedMessages.map((group, index) => (
    <div key={index} className="flex flex-col space-y-3">
      <div className="flex items-center justify-center my-3">
        <div className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full text-xs font-medium text-gray-600">
          {formatDate(group.date)}
        </div>
      </div>

      {group.messages.map((msg, idx) => {
        const sender = getMessageSender(msg);

        const prev = idx > 0 ? group.messages[idx - 1] : null;
        const prevSender = prev ? getMessageSender(prev) : null;

        const showSender = !prevSender || prevSender.name !== sender.name;

        const isLast =
          idx === group.messages.length - 1 ||
          getMessageSender(group.messages[idx + 1]).name !== sender.name;

        return (
          <div
            key={`${msg._id}_${msg.timestamp}`}
            className="animate-fade-in-up"
          >
            <MessageBubble
              msg={msg}
              sender={sender}
              showSender={showSender}
              isLastMessage={isLast}
              selectedContact={selectedContact}
              formatTime={formatTime}
            />
          </div>
        );
      })}
    </div>
  ));
};

export default MessageList;
