import { Contact, IChatMessage } from "../../../../../types";
import { Avatar, Tooltip } from "@nextui-org/react";
import { Video, FileText } from "lucide-react";
import { formatTime } from "./formatUtils";
import { useSelector } from "react-redux";
import { RootState } from "../../../../../redux/store";

// Props for the MessageItem component
interface MessageItemProps {
  message: IChatMessage;
  selectedContact: Contact | null;
  currentUserId?: string;
  showSender: boolean;
}

// Component to render a single message
const MessageItem: React.FC<MessageItemProps> = ({
  message,
  selectedContact,
  currentUserId,
  showSender,
}) => {
  const { currentUser } = useSelector((state: RootState) => state.user);

  // Get sender details
  const getMessageSender = (msg: IChatMessage) => {
    if (msg.senderId === currentUserId) {
      return {
        name: "You",
        profilePic: currentUser?.profilePic,
        isSelf: true,
      };
    }

    if (selectedContact?.type === "group" && selectedContact.groupDetails?.members) {
      const member = selectedContact.groupDetails.members.find((m) => m._id === msg.senderId);
      if (member) {
        return {
          name: member.name,
          profilePic: member.profilePic,
          isSelf: false,
        };
      }
    }

    return {
      name: selectedContact?.name || "Unknown",
      profilePic: selectedContact?.profilePic,
      isSelf: false,
    };
  };

  const sender = getMessageSender(message);
  const isSent = sender.isSelf;

  const bubbleClass = isSent
    ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl rounded-tr-none"
    : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-2xl rounded-tl-none";

  const timeBadge = (
    <span
      className={`text-xs ${isSent ? "text-blue-100" : "text-gray-500 dark:text-gray-400"} opacity-80`}
    >
      {formatTime(message.timestamp)}
    </span>
  );

  return (
    <div
      className={`flex ${isSent ? "flex-row-reverse" : "flex-row"} items-start gap-2 w-full max-w-[85%] sm:max-w-[70%] md:max-w-[60%] mx-auto sm:mx-0 ${
        isSent ? "ml-auto" : "mr-auto"
      } animate-fade-in-up`}
    >
      {!isSent && showSender && (
        <Tooltip content={sender.name} placement="left">
          <Avatar
            src={sender.profilePic}
            size="sm"
            className="mt-1 w-8 h-8 sm:w-10 sm:h-10"
            showFallback
            fallback={
              <div className="w-full h-full flex items-center justify-center bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs sm:text-sm font-medium">
                {sender.name.charAt(0).toUpperCase()}
              </div>
            }
          />
        </Tooltip>
      )}
      {isSent && <div className="w-8 sm:w-10" />}

      <div className={`flex flex-col ${isSent ? "items-end" : "items-start"} w-full`}>
        {!isSent && showSender && (
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400 ml-1 mb-1">
            {sender.name}
          </span>
        )}

        <div className={`p-2 sm:p-3 ${bubbleClass} shadow-sm w-full max-w-full`}>
          {message.contentType === "text" && (
            <div className="flex flex-col gap-1">
              <span className="break-words text-sm sm:text-base">{message.content}</span>
              <div
                className={`text-right ${isSent ? "text-blue-100" : "text-gray-500"} opacity-80 text-xs`}
              >
                {timeBadge}
              </div>
            </div>
          )}

          {message.contentType === "image" && (
            <div className="flex flex-col gap-1">
              <div className="rounded-lg overflow-hidden">
                <img
                  src={message.content}
                  alt="Sent image"
                  className="w-full h-auto max-w-[12rem] sm:max-w-[16rem] object-cover"
                />
              </div>
              <div
                className={`text-right ${isSent ? "text-blue-100" : "text-gray-500"} opacity-80 text-xs`}
              >
                {timeBadge}
              </div>
            </div>
          )}

          {message.contentType === "video" && message.thumbnailUrl && (
            <div className="flex flex-col gap-1">
              <div className="relative w-full max-w-[12rem] sm:max-w-[16rem] h-24 sm:h-36 rounded-lg overflow-hidden">
                <img
                  src={message.thumbnailUrl}
                  alt="Video thumbnail"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <button
                    onClick={() => window.open(message.content, "_blank")}
                    className="bg-black bg-opacity-60 rounded-full p-2 sm:p-3 transform transition-transform hover:scale-110"
                    aria-label="Play video"
                  >
                    <Video size={20} className="text-white" />
                  </button>
                </div>
              </div>
              <div
                className={`text-right ${isSent ? "text-blue-100" : "text-gray-500"} opacity-80 text-xs`}
              >
                {timeBadge}
              </div>
            </div>
          )}

          {message.contentType === "file" && (
            <div className="flex flex-col gap-1">
              {message.thumbnailUrl ? (
                <a
                  href={message.content}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full max-w-[12rem] sm:max-w-[16rem]"
                >
                  <div className="relative rounded-lg overflow-hidden">
                    <img
                      src={message.thumbnailUrl}
                      alt="File thumbnail"
                      className="w-full h-20 sm:h-24 object-cover"
                    />
                    <div className="absolute bottom-0 w-full bg-black bg-opacity-75 text-white text-xs p-2">
                      <div className="flex items-center gap-2">
                        <FileText size={14} />
                        <span className="truncate">{message.fileMetadata?.fileName || "File"}</span>
                      </div>
                    </div>
                  </div>
                </a>
              ) : (
                <a
                  href={message.content}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-2 py-2 px-3 rounded-lg w-full max-w-[12rem] sm:max-w-[16rem] ${
                    isSent
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white"
                  }`}
                >
                  <FileText size={16} />
                  <span className="truncate text-sm">{message.fileMetadata?.fileName || "File"}</span>
                </a>
              )}
              <div
                className={`text-right ${isSent ? "text-blue-100" : "text-gray-500"} opacity-80 text-xs`}
              >
                {timeBadge}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageItem;