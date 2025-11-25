import { Avatar, Badge } from "@nextui-org/react";
import { 
  getContactBgColor, 
  getContactIcon, 
  getMessagePreview 
} from "../utils/chatSidebarUtils";

const ContactItem = ({
  contact,
  unreadCounts,
  lastMessages,
  selected,
  currentUserId,
  onSelect
}) => {
  const chatKey = contact.id;
  const unread = unreadCounts[chatKey] || 0;
  const lastMessage = lastMessages[chatKey];

  return (
    <div
      className={`flex items-center p-2 rounded-xl cursor-pointer ${getContactBgColor(contact, selected)}`}
      onClick={onSelect}
    >
      <Badge content={unread > 0 ? unread : null} color="primary">
        <Avatar src={contact.profilePic} size="md" />
      </Badge>

      <div className="ml-3 flex-1">
        <p className="font-medium">{contact.name}</p>
        <p className="text-xs text-gray-500 truncate">
          {getMessagePreview(lastMessage, contact.type, currentUserId)}
        </p>
      </div>

      <div>{getContactIcon(contact.type)}</div>
    </div>
  );
};

export default ContactItem;
