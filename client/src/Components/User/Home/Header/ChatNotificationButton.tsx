import { NavbarItem, Badge, Link } from "@nextui-org/react";

interface Props {
  chatUnreadCount: number;
  handleChatClick: () => void;
}

const ChatNotificationButton = ({ chatUnreadCount, handleChatClick }: Props) => {
  return (
    <NavbarItem>
      <Badge
        content={chatUnreadCount}
        color="danger"
        isInvisible={chatUnreadCount === 0}
        placement="top-right"
        size="sm"
        className="animate-pulse"
      >
        <Link
          href="/chat"
          color="foreground"
          className="text-base font-semibold hover:text-blue-600 transition-all duration-200 relative group"
          onPress={handleChatClick}
        >
          Chat
          <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
        </Link>
      </Badge>
    </NavbarItem>
  );
};

export default ChatNotificationButton;
