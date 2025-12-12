import { Avatar, Badge } from "@nextui-org/react";
import { 
  formatMessageTime,
  getContactBgColor, 
  getContactIcon,
  getPreviewText, 
} from "../utils/chatSidebarUtils";


const ContactItem = ({
  chatKey,
  contact,
  unreadCounts,
  lastMessages,
  selected,
  currentUserId,
  onSelect,
}) => {
  const unread = unreadCounts[chatKey] || 0;
  const summary = lastMessages[chatKey];

  const preview = getPreviewText(summary, currentUserId);
  const time = summary ? formatMessageTime(summary.timestamp) : "";

  return (
    <div
      className={`flex items-center p-2 rounded-xl cursor-pointer ${getContactBgColor(
        contact,
        selected
      )}`}
      onClick={onSelect}
    >
      <Badge
        content={unread > 0 ? unread : null}
        color="primary"
        isInvisible={unread === 0}
      >
        <Avatar src={contact.profilePic} size="md" />
      </Badge>

      {/* Name + last message */}
      <div className="ml-3 flex-1 min-w-0">
        <div className="flex justify-between items-center">
          <p className="font-medium truncate">{contact.name}</p>
          {time && (
            <span className="text-[11px] text-gray-400 ml-2 shrink-0">
              {time}
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500 truncate mt-0.5">
          {preview}
        </p>
      </div>

      {/* Type icon */}
      <div className="ml-2">{getContactIcon(contact.type)}</div>
    </div>
  );
};

export default ContactItem;