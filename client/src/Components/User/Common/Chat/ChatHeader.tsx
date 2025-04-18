import React from "react";
import { Button, Tooltip, Avatar, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@nextui-org/react";
import { FaArrowLeft, FaPhone, FaVideo, FaBars, FaEllipsisV, FaUserFriends, FaInfoCircle } from "react-icons/fa";
import { Contact } from "../../../../types";

interface ChatHeaderProps {
  type?: string;
  selectedContact: Contact | null;
  navigate: (path: string) => void;
  toggleSidebar?: () => void;
  toggleDetailsSidebar?: () => void;
  isMobileView?: boolean;
  typingUsers: { [key: string]: string[] };
  getChatKey: (contact: Contact) => string;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  type,
  selectedContact,
  navigate,
  toggleSidebar,
  toggleDetailsSidebar,
  isMobileView,
  typingUsers,
  getChatKey,
}) => {
  const getGradient = () => {
    if (!selectedContact) return "from-violet-500 to-fuchsia-500";
    switch (selectedContact.type) {
      case "user-mentor":
        return "from-blue-500 to-cyan-400";
      case "user-user":
        return "from-purple-500 to-pink-500";
      case "group":
        return "from-emerald-500 to-teal-400";
      default:
        return "from-violet-500 to-fuchsia-500";
    }
  };

  const getTypingIndicator = () => {
    if (!selectedContact) return null;
    const chatKey = getChatKey(selectedContact);
    const typingUserIds = typingUsers[chatKey] || [];
    if (typingUserIds.length === 0) return null;

    const typingUsersNames = typingUserIds
      .map((userId) => {
        const member = selectedContact.groupDetails?.members.find(
          (m) => m._id === userId || m.userId === userId
        );
        return member?.name || "Someone";
      })
      .join(", ");

    return (
      <p className="text-xs text-green-200 animate-pulse">
        {typingUsersNames} {typingUsersNames.includes(",") ? "are" : "is"} typing...
      </p>
    );
  };


  return (
    <div
      className={`flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3 bg-gradient-to-r ${getGradient()} text-white rounded-t-xl shadow-md`}
    >
      <div className="flex items-center gap-2 sm:gap-3">
        {(isMobileView || type) && (
          <Button
            isIconOnly
            variant="light"
            onPress={type ? () => navigate("/chat") : toggleSidebar}
            className="text-white hover:bg-white/20 w-8 h-8 sm:w-10 sm:h-10"
            aria-label={type ? "Go back" : "Toggle sidebar"}
          >
            {type ? <FaArrowLeft size={16} /> : <FaBars size={16} />}
          </Button>
        )}

        {selectedContact && (
          <div className="flex items-center gap-2 sm:gap-3">
            <Avatar
              src={selectedContact.profilePic}
              className="border-2 border-white w-8 h-8 sm:w-10 sm:h-10"
              size="sm"
              isBordered
              color={
                selectedContact.type === "user-mentor"
                  ? "primary"
                  : selectedContact.type === "group"
                  ? "success"
                  : "secondary"
              }
            />
            <div>
              <h2 className="text-base sm:text-lg font-bold truncate max-w-[150px] sm:max-w-[200px]">
                {selectedContact.name}
              </h2>
                {getTypingIndicator() || (
                <p className="text-xs text-white/80 truncate max-w-[150px] sm:max-w-[200px]">
                  {selectedContact.type === "user-mentor"
                    ? "Mentorship"
                    : selectedContact.type === "group"
                    ? `${selectedContact.groupDetails?.members.length || 0} members`
                    : selectedContact.targetJobTitle || "Connection"}
                </p>
              )}
            </div>
          </div>
        )}

        {!selectedContact && (
          <h2 className="text-base sm:text-lg font-bold">Select a conversation</h2>
        )}
      </div>

      {selectedContact && (
        <div className="flex items-center gap-1 sm:gap-2">
          <Tooltip content="Voice call" placement="bottom">
            <Button
              isIconOnly
              variant="flat"
              className="bg-white/20 text-white hover:bg-white/30 transition-all w-8 h-8 sm:w-10 sm:h-10"
              onPress={() => alert("Audio call feature coming soon!")}
              aria-label="Voice call"
            >
              <FaPhone size={14} />
            </Button>
          </Tooltip>

          <Tooltip content="Video call" placement="bottom">
            <Button
              isIconOnly
              variant="flat"
              className="bg-white/20 text-white hover:bg-white/30 transition-all w-8 h-8 sm:w-10 sm:h-10"
              onPress={() => alert("Video call feature coming soon!")}
              aria-label="Video call"
            >
              <FaVideo size={14} />
            </Button>
          </Tooltip>

          <Dropdown>
            <DropdownTrigger>
              <Button
                isIconOnly
                variant="flat"
                className="bg-white/20 text-white hover:bg-white/30 transition-all w-8 h-8 sm:w-10 sm:h-10"
                aria-label="More options"
              >
                <FaEllipsisV size={14} />
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Chat options">
              <DropdownItem
                key="info"
                startContent={<FaInfoCircle />}
                onPress={toggleDetailsSidebar}
              >
                {isMobileView ? "Contact Info" : "Toggle Info Panel"}
              </DropdownItem>
              {selectedContact.type === "group" && (
                <DropdownItem key="members" startContent={<FaUserFriends />}>
                  View Members
                </DropdownItem>
              )}
            </DropdownMenu>
          </Dropdown>
        </div>
      )}
    </div>
  );
};

export default ChatHeader;