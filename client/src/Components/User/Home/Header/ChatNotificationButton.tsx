import { NavbarItem, Link } from "@nextui-org/react";

interface Props {
  chatUnreadCount: number;
  handleChatClick: () => void;
}

const ChatNotificationButton = ({ chatUnreadCount, handleChatClick }: Props) => {
  const hasUnread = chatUnreadCount > 0;
  return (
    <NavbarItem>
      <div className="relative inline-flex items-center">
        <Link
          href="/chat"
          color="foreground"
          className="text-base font-semibold hover:text-blue-600 transition-all duration-200 relative group"
          onPress={handleChatClick}
        >
          Chat
          <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
        </Link>

        {hasUnread && (
          <span
            className="absolute -top-1 -right-3 h-2 w-2 rounded-full bg-red-500 animate-ping"
          />
        )}
      </div>
    </NavbarItem>
  );
};

export default ChatNotificationButton;
