import { Avatar } from "@nextui-org/react";
import { FileText, Video, Download } from "lucide-react";
import { IChatMessage } from "../../../../../Interface/User/IchatMessage";
import { Contact } from "../../../../../Interface/User/Icontact";

interface MessageBubbleProps {
  msg: IChatMessage;
  sender: { name: string; profilePic?: string; isSelf: boolean };
  showSender: boolean;
  isLastMessage: boolean;
  selectedContact: Contact | null;
  formatTime: (ts: string | Date) => string;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  msg,
  sender,
  showSender,
  isLastMessage,
  selectedContact,
  formatTime,
}) => {
  const isSent = sender.isSelf;

  const renderStatus = () => {
    if (!isSent || !isLastMessage) return null;
    return (
      <span className="text-xs text-blue-500 ml-1 capitalize">
        {msg.status === "read"
          ? "read"
          : msg.status === "sent"
          ? "sent"
          : "waiting..."}
      </span>
    );
  };

  return (
    <div
      className={`flex items-end gap-2 mb-1 ${
        isSent ? "flex-row-reverse" : "flex-row"
      }`}
    >
      {/* Avatar */}
      {!isSent && (
        <div className="flex-shrink-0">
          {showSender ? (
            <Avatar
              src={sender.profilePic}
              size="sm"
              className="w-8 h-8"
              showFallback
              fallback={
                <div className="w-full h-full flex items-center justify-center bg-gray-300 dark:bg-gray-600 text-xs">
                  {sender.name.charAt(0).toUpperCase()}
                </div>
              }
            />
          ) : (
            <div className="w-8 h-8" />
          )}
        </div>
      )}

      {/* Body */}
      <div
        className={`flex flex-col max-w-xs sm:max-w-sm md:max-w-md ${
          isSent ? "items-end" : "items-start"
        }`}
      >
        {/* Sender name (group only) */}
        {!isSent &&
          showSender &&
          selectedContact?.type === "group" && (
            <span className="text-xs text-gray-500 mb-1 px-3">
              {sender.name}
            </span>
          )}

        {/* Bubble */}
        <div
          className={`relative px-3 py-2 rounded-2xl text-sm break-words max-w-full ${
            isSent
              ? "bg-blue-500 text-white rounded-br-md"
              : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-md"
          }`}
        >
          {/* TEXT */}
          {msg.contentType === "text" && <p>{msg.content}</p>}

          {/* IMAGE */}
          {msg.contentType === "image" && (
            <div className="space-y-2">
              <img
                src={msg.content}
                alt="Image"
                className="max-w-xs rounded-lg"
              />
              {msg.caption && <p>{msg.caption}</p>}
            </div>
          )}

          {/* VIDEO */}
          {msg.contentType === "video" && msg.thumbnailUrl && (
            <div className="space-y-2">
              <div className="relative rounded-lg overflow-hidden">
                <img
                  src={msg.thumbnailUrl}
                  alt="Video"
                  className="w-full h-32 object-cover"
                />
                <button
                  onClick={() => window.open(msg.content, "_blank")}
                  className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 hover:bg-opacity-50"
                >
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                    <Video size={20} className="text-gray-800 ml-1" />
                  </div>
                </button>
              </div>
              {msg.caption && <p>{msg.caption}</p>}
            </div>
          )}

          {/* FILE */}
          {msg.contentType === "file" && (
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-white bg-opacity-10">
                <FileText
                  size={20}
                  className={isSent ? "text-white" : "text-gray-600"}
                />

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {msg.fileMetadata?.fileName || "File"}
                  </p>
                  {msg.fileMetadata?.fileSize && (
                    <p className="text-xs text-gray-300">
                      {(msg.fileMetadata.fileSize / 1024).toFixed(1)} KB
                    </p>
                  )}
                </div>

                <button
                  onClick={() => window.open(msg.content, "_blank")}
                  aria-label="Download"
                >
                  <Download
                    size={16}
                    className={isSent ? "text-white" : "text-gray-600"}
                  />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* TIME + STATUS */}
        <div
          className={`flex items-center gap-1 mt-1 px-1 ${
            isSent ? "flex-row-reverse" : "flex-row"
          }`}
        >
          <span className="text-xs text-gray-400">
            {formatTime(msg.timestamp)}
          </span>
          {renderStatus()}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
